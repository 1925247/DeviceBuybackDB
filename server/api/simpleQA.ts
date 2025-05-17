import express, { Request, Response } from 'express';
import { pool } from '../db';

const router = express.Router();

// GET all questions
router.get('/', async (req: Request, res: Response) => {
  try {
    const groupId = req.query.groupId ? parseInt(req.query.groupId as string) : null;
    
    let query = `SELECT * FROM questions`;
    let params = [];
    
    if (groupId) {
      query += ` WHERE group_id = $1`;
      params.push(groupId);
    }
    
    query += ` ORDER BY "order"`;
    
    const result = await pool.query(query, params);
    
    // If questions exist, get their answer choices
    if (result.rows.length > 0) {
      const questionIds = result.rows.map(q => q.id);
      
      const choicesQuery = `
        SELECT * FROM answer_choices 
        WHERE question_id IN (${questionIds.join(',')})
      `;
      
      const choicesResult = await pool.query(choicesQuery);
      
      // Organize answer choices by question_id
      const choicesByQuestion: Record<number, any[]> = {};
      choicesResult.rows.forEach(choice => {
        if (!choicesByQuestion[choice.question_id]) {
          choicesByQuestion[choice.question_id] = [];
        }
        choicesByQuestion[choice.question_id].push(choice);
      });
      
      // Map database columns to client expected format
      result.rows.forEach(question => {
        // Convert snake_case to camelCase for client side
        question.questionText = question.question_text;
        question.groupId = question.group_id;
        question.questionType = question.question_type;
        
        // Convert answer_choices to the format client expects
        const choices = choicesByQuestion[question.id] || [];
        question.answerChoices = choices.map(choice => ({
          id: choice.id,
          answerText: choice.text,
          value: choice.value,
          order: choice.order || 0,
          weightage: choice.impact || 0,
          repairCost: choice.repair_cost || 0,
          isDefault: choice.is_default || false,
          icon: choice.icon || "",
          followUpAction: choice.follow_up_action || null
        }));
      });
    }
    
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch questions' });
  }
});

// GET a single question by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    const query = `SELECT * FROM questions WHERE id = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    const question = result.rows[0];
    
    // Get answer choices
    const choicesQuery = `SELECT * FROM answer_choices WHERE question_id = $1 ORDER BY "order"`;
    const choicesResult = await pool.query(choicesQuery, [id]);
    
    // Convert snake_case to camelCase for client side
    question.questionText = question.question_text;
    question.groupId = question.group_id;
    question.questionType = question.question_type;
    
    // Convert answer_choices to the format client expects
    question.answerChoices = choicesResult.rows.map(choice => ({
      id: choice.id,
      answerText: choice.text,
      value: choice.value,
      order: choice.order || 0,
      weightage: choice.impact || 0,
      repairCost: choice.repair_cost || 0,
      isDefault: choice.is_default || false,
      icon: choice.icon || "",
      followUpAction: choice.follow_up_action || null
    }));
    
    res.json(question);
  } catch (error: any) {
    console.error(`Error fetching question with ID ${req.params.id}:`, error);
    res.status(500).json({ message: error.message || 'Failed to fetch question' });
  }
});

// CREATE a new question
router.post('/', async (req: Request, res: Response) => {
  try {
    console.log('Creating question with data:', JSON.stringify(req.body, null, 2));
    
    // Start a transaction
    await pool.query('BEGIN');
    
    const { 
      questionText, 
      groupId, 
      active = true, 
      questionType, 
      order = 0, 
      tooltip = "", 
      required = false,
      answerChoices = []
    } = req.body;
    
    // Insert the question
    const questionQuery = `
      INSERT INTO questions (
        question_text, group_id, active, question_type, 
        "order", tooltip, required, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `;
    
    const questionParams = [
      questionText,
      groupId || null,
      active,
      questionType || 'single_choice',
      order,
      tooltip,
      required
    ];
    
    const questionResult = await pool.query(questionQuery, questionParams);
    const newQuestion = questionResult.rows[0];
    
    // Insert answer choices if provided
    if (answerChoices && answerChoices.length > 0) {
      for (let i = 0; i < answerChoices.length; i++) {
        const choice = answerChoices[i];
        if (!choice.answerText) continue; // Skip empty choices
        
        const choiceQuery = `
          INSERT INTO answer_choices (
            question_id, text, value, "order", impact, is_default, icon, follow_up_action, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
          RETURNING *
        `;
        
        // Convert empty strings to null for the database
        const choiceParams = [
          newQuestion.id,
          choice.answerText,
          choice.value || choice.answerText.toLowerCase().replace(/\s+/g, '_'),
          choice.order || i,
          choice.weightage || 0,
          choice.isDefault || false,
          choice.icon || null,
          choice.followUpAction || null
        ];
        
        await pool.query(choiceQuery, choiceParams);
      }
    }
    
    // Get the complete question with its answer choices
    const finalQuery = `SELECT * FROM questions WHERE id = $1`;
    const finalResult = await pool.query(finalQuery, [newQuestion.id]);
    const finalQuestion = finalResult.rows[0];
    
    // Get answer choices
    const finalChoicesQuery = `SELECT * FROM answer_choices WHERE question_id = $1 ORDER BY "order"`;
    const finalChoicesResult = await pool.query(finalChoicesQuery, [newQuestion.id]);
    
    // Convert snake_case to camelCase for client side
    finalQuestion.questionText = finalQuestion.question_text;
    finalQuestion.groupId = finalQuestion.group_id;
    finalQuestion.questionType = finalQuestion.question_type;
    
    // Convert answer_choices to the format client expects
    finalQuestion.answerChoices = finalChoicesResult.rows.map(choice => ({
      id: choice.id,
      answerText: choice.text,
      value: choice.value,
      order: choice.order || 0,
      weightage: choice.impact || 0,
      repairCost: choice.repair_cost || 0,
      isDefault: choice.is_default || false,
      icon: choice.icon || "",
      followUpAction: choice.follow_up_action || null
    }));
    
    // Commit the transaction
    await pool.query('COMMIT');
    
    res.status(201).json(finalQuestion);
  } catch (error: any) {
    // Roll back transaction in case of error
    await pool.query('ROLLBACK');
    console.error('Error creating question:', error);
    res.status(400).json({ message: error.message || 'Failed to create question' });
  }
});

// UPDATE a question
router.put('/:id', async (req: Request, res: Response) => {
  try {
    console.log(`Updating question ${req.params.id} with data:`, JSON.stringify(req.body, null, 2));
    
    const id = parseInt(req.params.id);
    
    // Start a transaction
    await pool.query('BEGIN');
    
    // Check if the question exists
    const checkQuery = `SELECT * FROM questions WHERE id = $1`;
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'Question not found' });
    }
    
    const { 
      questionText, 
      groupId, 
      active, 
      questionType, 
      order, 
      tooltip, 
      required,
      answerChoices = []
    } = req.body;
    
    // Update the question
    const updateQuery = `
      UPDATE questions
      SET 
        question_text = $1,
        group_id = $2,
        active = $3,
        question_type = $4,
        "order" = $5,
        tooltip = $6,
        required = $7,
        updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `;
    
    const updateParams = [
      questionText,
      groupId,
      active,
      questionType,
      order,
      tooltip,
      required,
      id
    ];
    
    const updateResult = await pool.query(updateQuery, updateParams);
    
    // Handle answer choices
    if (answerChoices && answerChoices.length > 0) {
      // Delete existing answer choices for this question
      await pool.query(`DELETE FROM answer_choices WHERE question_id = $1`, [id]);
      
      // Insert new answer choices
      for (let i = 0; i < answerChoices.length; i++) {
        const choice = answerChoices[i];
        if (!choice.answerText) continue; // Skip empty choices
        
        const choiceQuery = `
          INSERT INTO answer_choices (
            question_id, text, value, "order", impact, is_default, icon, follow_up_action, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
          RETURNING *
        `;
        
        // Convert empty strings to null for the database
        const choiceParams = [
          id,
          choice.answerText,
          choice.value || choice.answerText.toLowerCase().replace(/\s+/g, '_'),
          choice.order || i,
          choice.weightage || 0,
          choice.isDefault || false,
          choice.icon || null,
          choice.followUpAction || null
        ];
        
        await pool.query(choiceQuery, choiceParams);
      }
    }
    
    // Get the updated question with its answer choices
    const finalQuery = `SELECT * FROM questions WHERE id = $1`;
    const finalResult = await pool.query(finalQuery, [id]);
    const updatedQuestion = finalResult.rows[0];
    
    // Get answer choices
    const choicesQuery = `SELECT * FROM answer_choices WHERE question_id = $1 ORDER BY "order"`;
    const choicesResult = await pool.query(choicesQuery, [id]);
    
    // Convert snake_case to camelCase for client side
    updatedQuestion.questionText = updatedQuestion.question_text;
    updatedQuestion.groupId = updatedQuestion.group_id;
    updatedQuestion.questionType = updatedQuestion.question_type;
    
    // Convert answer_choices to the format client expects
    updatedQuestion.answerChoices = choicesResult.rows.map(choice => ({
      id: choice.id,
      answerText: choice.text,
      value: choice.value,
      order: choice.order || 0,
      weightage: choice.impact || 0,
      repairCost: choice.repair_cost || 0,
      isDefault: choice.is_default || false,
      icon: choice.icon || "",
      followUpAction: choice.follow_up_action || null
    }));
    
    // Commit the transaction
    await pool.query('COMMIT');
    
    res.json(updatedQuestion);
  } catch (error: any) {
    // Roll back transaction in case of error
    await pool.query('ROLLBACK');
    console.error(`Error updating question with ID ${req.params.id}:`, error);
    res.status(400).json({ message: error.message || 'Failed to update question' });
  }
});

// DELETE a question
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Start a transaction
    await pool.query('BEGIN');
    
    // Delete answer choices first
    await pool.query(`DELETE FROM answer_choices WHERE question_id = $1`, [id]);
    
    // Delete the question
    const deleteQuery = `DELETE FROM questions WHERE id = $1 RETURNING id`;
    const deleteResult = await pool.query(deleteQuery, [id]);
    
    if (deleteResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'Question not found' });
    }
    
    // Commit the transaction
    await pool.query('COMMIT');
    
    res.json({ 
      id, 
      message: 'Question deleted successfully' 
    });
  } catch (error: any) {
    // Roll back transaction in case of error
    await pool.query('ROLLBACK');
    console.error(`Error deleting question with ID ${req.params.id}:`, error);
    res.status(500).json({ message: error.message || 'Failed to delete question' });
  }
});

export default router;