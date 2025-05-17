import { Request, Response } from "express";
import { pool } from "../db";

// Get all question groups
export async function getQuestionGroups(req: Request, res: Response) {
  try {
    const query = `
      SELECT 
        qg.id, 
        qg.name, 
        qg.statement, 
        qg.device_type_id as "deviceTypeId", 
        qg.icon,
        qg.active,
        COUNT(q.id) as question_count,
        dt.name as device_type_name
      FROM question_groups qg
      LEFT JOIN questions q ON qg.id = q.group_id
      LEFT JOIN device_types dt ON qg.device_type_id = dt.id
      GROUP BY qg.id, dt.name
      ORDER BY qg.name
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching question groups:", error);
    res.status(500).json({ message: "Failed to fetch question groups" });
  }
}

// Get a specific question group with its questions
export async function getQuestionGroup(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // First get the group details
    const groupQuery = `
      SELECT 
        qg.id, 
        qg.name, 
        qg.statement, 
        qg.device_type_id as "deviceTypeId", 
        qg.icon,
        qg.active,
        dt.name as device_type_name
      FROM question_groups qg
      LEFT JOIN device_types dt ON qg.device_type_id = dt.id
      WHERE qg.id = $1
    `;
    
    const groupResult = await pool.query(groupQuery, [id]);
    
    if (groupResult.rows.length === 0) {
      return res.status(404).json({ message: "Question group not found" });
    }
    
    // Then get all questions in this group
    const questionsQuery = `
      SELECT 
        q.id, 
        q.question_text as "questionText", 
        q.question_type as "questionType",
        q.group_id as "groupId",
        q.order,
        q.active,
        q.tooltip,
        q.required,
        q.created_at as "createdAt",
        q.updated_at as "updatedAt"
      FROM questions q
      WHERE q.group_id = $1
      ORDER BY q.order, q.id
    `;
    
    const questionsResult = await pool.query(questionsQuery, [id]);
    
    // Get all answer choices for each question
    const questions = questionsResult.rows;
    const questionsWithChoices = [];
    
    for (const question of questions) {
      const choicesQuery = `
        SELECT 
          id,
          answer_text as "answerText",
          text,
          icon,
          weightage,
          impact,
          repair_cost as "repairCost",
          is_default as "isDefault",
          follow_up_action as "followUpAction",
          "order"
        FROM answer_choices
        WHERE question_id = $1
        ORDER BY "order", id
      `;
      
      const choicesResult = await pool.query(choicesQuery, [question.id]);
      questionsWithChoices.push({
        ...question,
        answerChoices: choicesResult.rows
      });
    }
    
    // Combine the results
    const group = {
      ...groupResult.rows[0],
      questions: questionsWithChoices
    };
    
    res.json(group);
  } catch (error) {
    console.error("Error fetching question group:", error);
    res.status(500).json({ message: "Failed to fetch question group" });
  }
}

// Get a specific question with its answer choices
export async function getQuestion(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // First get the question details
    const questionQuery = `
      SELECT 
        q.id, 
        q.question_text as "questionText", 
        q.question_type as "questionType",
        q.group_id as "groupId",
        q.order,
        q.active,
        q.tooltip,
        q.required,
        q.created_at as "createdAt",
        q.updated_at as "updatedAt",
        qg.name as group_name
      FROM questions q
      LEFT JOIN question_groups qg ON q.group_id = qg.id
      WHERE q.id = $1
    `;
    
    const questionResult = await pool.query(questionQuery, [id]);
    
    if (questionResult.rows.length === 0) {
      return res.status(404).json({ message: "Question not found" });
    }
    
    // Then get all answer choices for this question
    const choicesQuery = `
      SELECT 
        id,
        answer_text as "answerText",
        icon,
        weightage,
        repair_cost as "repairCost",
        is_default as "isDefault",
        follow_up_action as "followUpAction",
        "order"
      FROM answer_choices
      WHERE question_id = $1
      ORDER BY "order", id
    `;
    
    const choicesResult = await pool.query(choicesQuery, [id]);
    
    // Combine the results
    const question = {
      ...questionResult.rows[0],
      answerChoices: choicesResult.rows
    };
    
    res.json(question);
  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(500).json({ message: "Failed to fetch question" });
  }
}

// Create a new question with answer choices
export async function createQuestion(req: Request, res: Response) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { questionText, questionType, groupId, order, active, tooltip, required, answerChoices } = req.body;
    
    // Insert the question
    const questionQuery = `
      INSERT INTO questions 
      (question_text, question_type, group_id, "order", active, tooltip, required, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `;
    
    const questionResult = await client.query(questionQuery, [
      questionText,
      questionType,
      groupId,
      order || 0,
      active !== undefined ? active : true,
      tooltip || null,
      required !== undefined ? required : true
    ]);
    
    const question = questionResult.rows[0];
    const questionId = question.id;
    
    // If there are answer choices, insert them
    if (answerChoices && answerChoices.length > 0 && 
        (questionType === 'single_choice' || questionType === 'multiple_choice')) {
      
      for (let i = 0; i < answerChoices.length; i++) {
        const choice = answerChoices[i];
        const choiceOrder = choice.order !== undefined ? choice.order : i;
        
        const choiceQuery = `
          INSERT INTO answer_choices 
          (question_id, answer_text, text, value, icon, weightage, repair_cost, is_default, follow_up_action, "order", created_at, updated_at)
          VALUES ($1, $2, $2, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        `;
        
        await client.query(choiceQuery, [
          questionId,
          choice.answerText,
          choice.icon || null,
          choice.weightage || 0,
          choice.repairCost || 0,
          choice.isDefault || false,
          choice.followUpAction || null,
          choiceOrder
        ]);
      }
    }
    
    await client.query('COMMIT');
    
    // Return the full question with answer choices
    const completeQuery = `
      SELECT 
        q.id, 
        q.question_text as "questionText", 
        q.question_type as "questionType",
        q.group_id as "groupId",
        q.order,
        q.active,
        q.tooltip,
        q.required,
        (
          SELECT json_agg(
            json_build_object(
              'id', ac.id,
              'answerText', ac.answer_text,
              'icon', ac.icon,
              'weightage', ac.weightage,
              'repairCost', ac.repair_cost,
              'isDefault', ac.is_default,
              'followUpAction', ac.follow_up_action,
              'order', ac.order
            )
          )
          FROM answer_choices ac
          WHERE ac.question_id = q.id
        ) as "answerChoices"
      FROM questions q
      WHERE q.id = $1
    `;
    
    const completeResult = await pool.query(completeQuery, [questionId]);
    res.status(201).json(completeResult.rows[0]);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error creating question:", error);
    res.status(500).json({ message: "Failed to create question" });
  } finally {
    client.release();
  }
}

// Update a question and its answer choices
export async function updateQuestion(req: Request, res: Response) {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { questionText, questionType, groupId, order, active, tooltip, required, answerChoices } = req.body;
    
    await client.query('BEGIN');
    
    // Build query for updating question
    let updateFields = [];
    let params = [id];
    let paramIndex = 2;
    
    if (questionText !== undefined) {
      updateFields.push(`question_text = $${paramIndex++}`);
      params.push(questionText);
    }
    
    if (questionType !== undefined) {
      updateFields.push(`question_type = $${paramIndex++}`);
      params.push(questionType);
    }
    
    if (groupId !== undefined) {
      updateFields.push(`group_id = $${paramIndex++}`);
      params.push(groupId);
    }
    
    if (order !== undefined) {
      updateFields.push(`"order" = $${paramIndex++}`);
      params.push(order);
    }
    
    if (active !== undefined) {
      updateFields.push(`active = $${paramIndex++}`);
      params.push(active);
    }
    
    if (tooltip !== undefined) {
      updateFields.push(`tooltip = $${paramIndex++}`);
      params.push(tooltip);
    }
    
    if (required !== undefined) {
      updateFields.push(`required = $${paramIndex++}`);
      params.push(required);
    }
    
    updateFields.push(`updated_at = NOW()`);
    
    // Update question if there are fields to update
    if (updateFields.length > 1) {
      const questionQuery = `
        UPDATE questions
        SET ${updateFields.join(', ')}
        WHERE id = $1
        RETURNING *
      `;
      
      const questionResult = await client.query(questionQuery, params);
      
      if (questionResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: "Question not found" });
      }
    }
    
    // Handle answer choices if provided
    if (answerChoices && answerChoices.length > 0) {
      // Get existing answer choices
      const existingChoicesQuery = `
        SELECT id FROM answer_choices WHERE question_id = $1
      `;
      
      const existingChoicesResult = await client.query(existingChoicesQuery, [id]);
      const existingChoiceIds = new Set(existingChoicesResult.rows.map(row => row.id));
      
      // Track IDs that should remain
      const keepChoiceIds = new Set();
      
      // Process each answer choice
      for (let i = 0; i < answerChoices.length; i++) {
        const choice = answerChoices[i];
        const choiceOrder = choice.order !== undefined ? choice.order : i;
        
        if (choice.id && existingChoiceIds.has(choice.id)) {
          // Update existing choice
          keepChoiceIds.add(choice.id);
          
          const updateChoiceQuery = `
            UPDATE answer_choices
            SET answer_text = $1, text = $1, value = $1,
                icon = $2, weightage = $3, repair_cost = $4,
                is_default = $5, follow_up_action = $6, "order" = $7,
                updated_at = NOW()
            WHERE id = $8
          `;
          
          await client.query(updateChoiceQuery, [
            choice.answerText,
            choice.icon || null,
            choice.weightage || 0,
            choice.repairCost || 0,
            choice.isDefault || false,
            choice.followUpAction || null,
            choiceOrder,
            choice.id
          ]);
        } else {
          // Create new choice
          const createChoiceQuery = `
            INSERT INTO answer_choices 
            (question_id, answer_text, text, value, icon, weightage, repair_cost, is_default, follow_up_action, "order", created_at, updated_at)
            VALUES ($1, $2, $2, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
            RETURNING id
          `;
          
          const result = await client.query(createChoiceQuery, [
            id,
            choice.answerText,
            choice.icon || null,
            choice.weightage || 0,
            choice.repairCost || 0,
            choice.isDefault || false,
            choice.followUpAction || null,
            choiceOrder
          ]);
          
          keepChoiceIds.add(result.rows[0].id);
        }
      }
      
      // Delete choices that weren't in the update
      const choiceIdsToDelete = Array.from(existingChoiceIds).filter(id => !keepChoiceIds.has(id));
      
      if (choiceIdsToDelete.length > 0) {
        const deleteChoicesQuery = `
          DELETE FROM answer_choices
          WHERE id IN (${choiceIdsToDelete.join(',')})
        `;
        
        await client.query(deleteChoicesQuery);
      }
    }
    
    await client.query('COMMIT');
    
    // Get the updated question with answer choices
    const completeQuery = `
      SELECT 
        q.id, 
        q.question_text as "questionText", 
        q.question_type as "questionType",
        q.group_id as "groupId",
        q.order,
        q.active,
        q.tooltip,
        q.required,
        (
          SELECT json_agg(
            json_build_object(
              'id', ac.id,
              'answerText', ac.answer_text,
              'icon', ac.icon,
              'weightage', ac.weightage,
              'repairCost', ac.repair_cost,
              'isDefault', ac.is_default,
              'followUpAction', ac.follow_up_action,
              'order', ac.order
            )
          )
          FROM answer_choices ac
          WHERE ac.question_id = q.id
        ) as "answerChoices"
      FROM questions q
      WHERE q.id = $1
    `;
    
    const completeResult = await pool.query(completeQuery, [id]);
    res.json(completeResult.rows[0]);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error updating question:", error);
    res.status(500).json({ message: "Failed to update question" });
  } finally {
    client.release();
  }
}

// Delete a question and its answer choices
export async function deleteQuestion(req: Request, res: Response) {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    
    await client.query('BEGIN');
    
    // Delete answer choices first (due to foreign key constraint)
    const deleteChoicesQuery = `
      DELETE FROM answer_choices
      WHERE question_id = $1
    `;
    
    await client.query(deleteChoicesQuery, [id]);
    
    // Delete the question
    const deleteQuestionQuery = `
      DELETE FROM questions
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await client.query(deleteQuestionQuery, [id]);
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Question not found" });
    }
    
    await client.query('COMMIT');
    
    res.json({ message: "Question deleted successfully" });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error deleting question:", error);
    res.status(500).json({ message: "Failed to delete question" });
  } finally {
    client.release();
  }
}