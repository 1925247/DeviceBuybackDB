import { Request, Response } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";
import * as schema from "@shared/schema";
import { z } from "zod";

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
    
    const result = await db.execute(sql.raw(query));
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
    
    const groupResult = await db.execute(sql.raw(groupQuery), [id]);
    
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
    
    const questionsResult = await db.execute(sql.raw(questionsQuery), [id]);
    
    // Combine the results
    const group = {
      ...groupResult.rows[0],
      questions: questionsResult.rows
    };
    
    res.json(group);
  } catch (error) {
    console.error("Error fetching question group:", error);
    res.status(500).json({ message: "Failed to fetch question group" });
  }
}

// Create a new question group
export async function createQuestionGroup(req: Request, res: Response) {
  try {
    const schema = z.object({
      name: z.string(),
      statement: z.string(),
      deviceTypeId: z.number().nullable(),
      icon: z.string().nullable(),
      active: z.boolean().default(true)
    });
    
    const data = schema.parse(req.body);
    
    const query = `
      INSERT INTO question_groups (name, statement, device_type_id, icon, active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;
    
    const result = await db.execute(sql.raw(query), [
      data.name,
      data.statement,
      data.deviceTypeId,
      data.icon,
      data.active
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating question group:", error);
    res.status(500).json({ message: "Failed to create question group" });
  }
}

// Update a question group
export async function updateQuestionGroup(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const schema = z.object({
      name: z.string().optional(),
      statement: z.string().optional(),
      deviceTypeId: z.number().nullable().optional(),
      icon: z.string().nullable().optional(),
      active: z.boolean().optional()
    });
    
    const data = schema.parse(req.body);
    
    // Build dynamic query based on provided fields
    let setClause = [];
    let params = [id];
    let paramIndex = 2;
    
    if (data.name !== undefined) {
      setClause.push(`name = $${paramIndex++}`);
      params.push(data.name);
    }
    
    if (data.statement !== undefined) {
      setClause.push(`statement = $${paramIndex++}`);
      params.push(data.statement);
    }
    
    if (data.deviceTypeId !== undefined) {
      setClause.push(`device_type_id = $${paramIndex++}`);
      params.push(data.deviceTypeId);
    }
    
    if (data.icon !== undefined) {
      setClause.push(`icon = $${paramIndex++}`);
      params.push(data.icon);
    }
    
    if (data.active !== undefined) {
      setClause.push(`active = $${paramIndex++}`);
      params.push(data.active);
    }
    
    setClause.push(`updated_at = NOW()`);
    
    if (setClause.length === 1) {
      return res.status(400).json({ message: "No fields to update" });
    }
    
    const query = `
      UPDATE question_groups
      SET ${setClause.join(', ')}
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await db.execute(sql.raw(query), params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Question group not found" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating question group:", error);
    res.status(500).json({ message: "Failed to update question group" });
  }
}

// Delete a question group
export async function deleteQuestionGroup(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // First check if there are any questions in this group
    const checkQuery = `
      SELECT COUNT(*) as count FROM questions WHERE group_id = $1
    `;
    
    const checkResult = await db.execute(sql.raw(checkQuery), [id]);
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: "Cannot delete group with existing questions. Delete questions first or move them to another group."
      });
    }
    
    const deleteQuery = `
      DELETE FROM question_groups
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await db.execute(sql.raw(deleteQuery), [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Question group not found" });
    }
    
    res.json({ message: "Question group deleted successfully" });
  } catch (error) {
    console.error("Error deleting question group:", error);
    res.status(500).json({ message: "Failed to delete question group" });
  }
}

// Get all questions
export async function getQuestions(req: Request, res: Response) {
  try {
    const query = `
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
      ORDER BY qg.name, q.order, q.id
    `;
    
    const result = await db.execute(sql.raw(query));
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: "Failed to fetch questions" });
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
    
    const questionResult = await db.execute(sql.raw(questionQuery), [id]);
    
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
    
    const choicesResult = await db.execute(sql.raw(choicesQuery), [id]);
    
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
  try {
    const schema = z.object({
      questionText: z.string(),
      questionType: z.enum(["single_choice", "multiple_choice", "text_input"]),
      groupId: z.number(),
      order: z.number().default(0),
      active: z.boolean().default(true),
      tooltip: z.string().nullable().default(null),
      required: z.boolean().default(true),
      answerChoices: z.array(z.object({
        answerText: z.string(),
        icon: z.string().nullable().default(null),
        weightage: z.number().default(0),
        repairCost: z.number().default(0),
        isDefault: z.boolean().default(false),
        followUpAction: z.string().nullable().default(null),
        order: z.number().optional()
      })).optional()
    });
    
    const data = schema.parse(req.body);
    
    // Begin a transaction
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Insert the question
      const questionQuery = `
        INSERT INTO questions 
        (question_text, question_type, group_id, "order", active, tooltip, required, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *
      `;
      
      const questionResult = await client.query(questionQuery, [
        data.questionText,
        data.questionType,
        data.groupId,
        data.order,
        data.active,
        data.tooltip,
        data.required
      ]);
      
      const question = questionResult.rows[0];
      const questionId = question.id;
      
      // If there are answer choices, insert them
      if (data.answerChoices && data.answerChoices.length > 0 && 
          (data.questionType === 'single_choice' || data.questionType === 'multiple_choice')) {
        
        for (let i = 0; i < data.answerChoices.length; i++) {
          const choice = data.answerChoices[i];
          const choiceOrder = choice.order !== undefined ? choice.order : i;
          
          const choiceQuery = `
            INSERT INTO answer_choices 
            (question_id, answer_text, text, value, icon, weightage, repair_cost, is_default, follow_up_action, "order", created_at, updated_at)
            VALUES ($1, $2, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
          `;
          
          await client.query(choiceQuery, [
            questionId,
            choice.answerText,
            choice.answerText,
            choice.icon,
            choice.weightage,
            choice.repairCost,
            choice.isDefault,
            choice.followUpAction,
            choiceOrder
          ]);
        }
      }
      
      await client.query('COMMIT');
      
      // Get the complete question with answer choices
      const completeQuestion = await getQuestion({ params: { id: questionId } } as any, res);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({ message: "Failed to create question" });
  }
}

// Update a question and its answer choices
export async function updateQuestion(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const schema = z.object({
      questionText: z.string().optional(),
      questionType: z.enum(["single_choice", "multiple_choice", "text_input"]).optional(),
      groupId: z.number().optional(),
      order: z.number().optional(),
      active: z.boolean().optional(),
      tooltip: z.string().nullable().optional(),
      required: z.boolean().optional(),
      answerChoices: z.array(z.object({
        id: z.number().optional(),
        answerText: z.string(),
        icon: z.string().nullable().default(null),
        weightage: z.number().default(0),
        repairCost: z.number().default(0),
        isDefault: z.boolean().default(false),
        followUpAction: z.string().nullable().default(null),
        order: z.number().optional()
      })).optional()
    });
    
    const data = schema.parse(req.body);
    
    // Begin a transaction
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Build dynamic query based on provided fields
      let setClause = [];
      let params = [id];
      let paramIndex = 2;
      
      if (data.questionText !== undefined) {
        setClause.push(`question_text = $${paramIndex++}`);
        params.push(data.questionText);
      }
      
      if (data.questionType !== undefined) {
        setClause.push(`question_type = $${paramIndex++}`);
        params.push(data.questionType);
      }
      
      if (data.groupId !== undefined) {
        setClause.push(`group_id = $${paramIndex++}`);
        params.push(data.groupId);
      }
      
      if (data.order !== undefined) {
        setClause.push(`"order" = $${paramIndex++}`);
        params.push(data.order);
      }
      
      if (data.active !== undefined) {
        setClause.push(`active = $${paramIndex++}`);
        params.push(data.active);
      }
      
      if (data.tooltip !== undefined) {
        setClause.push(`tooltip = $${paramIndex++}`);
        params.push(data.tooltip);
      }
      
      if (data.required !== undefined) {
        setClause.push(`required = $${paramIndex++}`);
        params.push(data.required);
      }
      
      setClause.push(`updated_at = NOW()`);
      
      if (setClause.length > 1) {
        const questionQuery = `
          UPDATE questions
          SET ${setClause.join(', ')}
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
      if (data.answerChoices && data.answerChoices.length > 0) {
        // Get existing answer choices to determine which ones to update, create, or delete
        const existingChoicesQuery = `
          SELECT id FROM answer_choices WHERE question_id = $1
        `;
        
        const existingChoicesResult = await client.query(existingChoicesQuery, [id]);
        const existingChoiceIds = new Set(existingChoicesResult.rows.map(row => row.id));
        
        // Track IDs of choices that should remain after the update
        const keepChoiceIds = new Set();
        
        // Process each answer choice
        for (let i = 0; i < data.answerChoices.length; i++) {
          const choice = data.answerChoices[i];
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
              choice.icon,
              choice.weightage,
              choice.repairCost,
              choice.isDefault,
              choice.followUpAction,
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
              choice.icon,
              choice.weightage,
              choice.repairCost,
              choice.isDefault,
              choice.followUpAction,
              choiceOrder
            ]);
            
            keepChoiceIds.add(result.rows[0].id);
          }
        }
        
        // Delete choices that weren't in the update
        const choiceIdsToDelete = [...existingChoiceIds].filter(id => !keepChoiceIds.has(id));
        
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
      const updatedQuestion = await getQuestion({ params: { id } } as any, res);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({ message: "Failed to update question" });
  }
}

// Delete a question and its answer choices
export async function deleteQuestion(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Begin a transaction
    const client = await db.getClient();
    
    try {
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
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ message: "Failed to delete question" });
  }
}