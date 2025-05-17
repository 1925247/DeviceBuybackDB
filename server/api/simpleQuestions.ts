import express, { Request, Response } from 'express';
import { pool } from '../db';
import { z } from 'zod';

const router = express.Router();

// GET all questions with optional group filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const groupId = req.query.groupId ? parseInt(req.query.groupId as string) : null;
    
    let query = `
      SELECT q.*, 
      (
          SELECT json_agg(
              json_build_object(
                  'id', ac.id,
                  'questionId', ac.question_id,
                  'text', ac.text,
                  'value', ac.value,
                  'order', ac."order",
                  'impact', ac.impact,
                  'createdAt', ac.created_at,
                  'updatedAt', ac.updated_at
              )
          )
          FROM answer_choices ac
          WHERE ac.question_id = q.id
      ) as answer_choices
      FROM questions q
    `;
    
    const queryParams = [];
    
    if (groupId) {
      query += ` WHERE q.group_id = $1`;
      queryParams.push(groupId);
    }
    
    query += ` ORDER BY q.id`;
    
    const result = await pool.query(query, queryParams);
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
    
    const query = `
      SELECT q.*, 
      (
          SELECT json_agg(
              json_build_object(
                  'id', ac.id,
                  'questionId', ac.question_id,
                  'text', ac.text,
                  'value', ac.value,
                  'order', ac."order",
                  'impact', ac.impact,
                  'createdAt', ac.created_at,
                  'updatedAt', ac.updated_at
              )
          )
          FROM answer_choices ac
          WHERE ac.question_id = q.id
      ) as answer_choices
      FROM questions q
      WHERE q.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error(`Error fetching question with ID ${req.params.id}:`, error);
    res.status(500).json({ message: error.message || 'Failed to fetch question' });
  }
});

// CREATE a new question
router.post('/', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      questionText: z.string(),
      groupId: z.number().optional().nullable(),
      active: z.boolean().optional().nullable(),
      questionType: z.enum(['single_choice', 'multiple_choice', 'text_input']),
      order: z.number().optional().nullable(),
      tooltip: z.string().optional().nullable(),
      required: z.boolean().optional().nullable(),
      answerChoices: z.array(
        z.object({
          text: z.string(),
          value: z.string(),
          order: z.number(),
          impact: z.number().optional()
        })
      ).optional()
    });
    
    const validatedData = schema.parse(req.body);
    
    // Insert the question
    const questionQuery = `
      INSERT INTO questions (
        question_text, group_id, active, question_type, 
        "order", tooltip, required, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id, question_text as "questionText", group_id as "groupId", 
                active, question_type as "questionType", "order", 
                tooltip, required, created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const questionParams = [
      validatedData.questionText,
      validatedData.groupId || null,
      validatedData.active !== null ? validatedData.active : true,
      validatedData.questionType,
      validatedData.order !== null ? validatedData.order : 0,
      validatedData.tooltip || null,
      validatedData.required !== null ? validatedData.required : false
    ];
    
    const questionResult = await pool.query(questionQuery, questionParams);
    const question = questionResult.rows[0];
    
    // If there are answer choices, insert them
    if (validatedData.answerChoices && validatedData.answerChoices.length > 0) {
      const answerPromises = validatedData.answerChoices.map(async (choice) => {
        const choiceQuery = `
          INSERT INTO answer_choices (
            question_id, text, value, "order", impact, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          RETURNING id, question_id as "questionId", text, value, "order", 
                    impact,
                    created_at as "createdAt", updated_at as "updatedAt"
        `;
        
        const choiceParams = [
          question.id,
          choice.text,
          choice.value,
          choice.order,
          choice.impact || 0
        ];
        
        const choiceResult = await pool.query(choiceQuery, choiceParams);
        return choiceResult.rows[0];
      });
      
      const answerChoices = await Promise.all(answerPromises);
      question.answerChoices = answerChoices;
    }
    
    res.status(201).json(question);
  } catch (error: any) {
    console.error('Error creating question:', error);
    res.status(400).json({ message: error.message || 'Failed to create question' });
  }
});

// UPDATE a question
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    const schema = z.object({
      questionText: z.string().optional(),
      groupId: z.number().optional().nullable(),
      active: z.boolean().optional().nullable(),
      questionType: z.enum(['single_choice', 'multiple_choice', 'text_input']).optional(),
      order: z.number().optional().nullable(),
      tooltip: z.string().optional().nullable(),
      required: z.boolean().optional().nullable(),
      answerChoices: z.array(
        z.object({
          id: z.number().optional(),
          text: z.string(),
          value: z.string(),
          order: z.number(),
          impact: z.number().optional()
        })
      ).optional()
    });
    
    const validatedData = schema.parse(req.body);
    
    // Build the SET clause for the UPDATE query
    const updates = [];
    const params = [id]; // First parameter is the question ID
    let paramIndex = 2;
    
    if ('questionText' in validatedData) {
      updates.push(`question_text = $${paramIndex++}`);
      params.push(validatedData.questionText);
    }
    
    if ('groupId' in validatedData) {
      updates.push(`group_id = $${paramIndex++}`);
      params.push(validatedData.groupId);
    }
    
    if ('active' in validatedData) {
      updates.push(`active = $${paramIndex++}`);
      params.push(validatedData.active);
    }
    
    if ('questionType' in validatedData) {
      updates.push(`question_type = $${paramIndex++}`);
      params.push(validatedData.questionType);
    }
    
    if ('order' in validatedData) {
      updates.push(`"order" = $${paramIndex++}`);
      params.push(validatedData.order);
    }
    
    if ('tooltip' in validatedData) {
      updates.push(`tooltip = $${paramIndex++}`);
      params.push(validatedData.tooltip);
    }
    
    if ('required' in validatedData) {
      updates.push(`required = $${paramIndex++}`);
      params.push(validatedData.required);
    }
    
    updates.push(`updated_at = NOW()`);
    
    if (updates.length === 1) {
      // Only updated_at is being updated, nothing else changed
      return res.status(304).json({ message: 'No changes to update' });
    }
    
    const questionQuery = `
      UPDATE questions
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING id, question_text as "questionText", group_id as "groupId", 
                active, question_type as "questionType", "order", 
                tooltip, required, created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const questionResult = await pool.query(questionQuery, params);
    
    if (questionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    const question = questionResult.rows[0];
    
    // Handle answer choices if provided
    if (validatedData.answerChoices) {
      // Get existing answer choices
      const existingChoicesQuery = `
        SELECT id FROM answer_choices WHERE question_id = $1
      `;
      
      const existingChoicesResult = await pool.query(existingChoicesQuery, [id]);
      const existingChoiceIds = new Set(existingChoicesResult.rows.map(row => row.id));
      
      // Process each answer choice
      const answerPromises = validatedData.answerChoices.map(async (choice) => {
        if (choice.id && existingChoiceIds.has(choice.id)) {
          // Update existing choice
          const choiceQuery = `
            UPDATE answer_choices
            SET text = $1, value = $2, "order" = $3, impact = $4, updated_at = NOW()
            WHERE id = $5 AND question_id = $6
            RETURNING id, question_id as "questionId", text, value, "order", 
                      impact, 
                      created_at as "createdAt", updated_at as "updatedAt"
          `;
          
          const choiceParams = [
            choice.text,
            choice.value,
            choice.order,
            choice.impact || 0,
            choice.id,
            id
          ];
          
          const choiceResult = await pool.query(choiceQuery, choiceParams);
          return choiceResult.rows[0];
        } else {
          // Create new choice
          const choiceQuery = `
            INSERT INTO answer_choices (
              question_id, text, value, "order", impact, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
            RETURNING id, question_id as "questionId", text, value, "order", 
                      impact, 
                      created_at as "createdAt", updated_at as "updatedAt"
          `;
          
          const choiceParams = [
            id,
            choice.text,
            choice.value,
            choice.order,
            choice.impact || 0
          ];
          
          const choiceResult = await pool.query(choiceQuery, choiceParams);
          return choiceResult.rows[0];
        }
      });
      
      const answerChoices = await Promise.all(answerPromises);
      
      // Get the complete updated question with answer choices
      const updatedQuestionQuery = `
        SELECT q.*, 
        (
            SELECT json_agg(
                json_build_object(
                    'id', ac.id,
                    'questionId', ac.question_id,
                    'text', ac.text,
                    'value', ac.value,
                    'order', ac."order",
                    'impact', ac.impact,
                    'createdAt', ac.created_at,
                    'updatedAt', ac.updated_at
                )
            )
            FROM answer_choices ac
            WHERE ac.question_id = q.id
        ) as answer_choices
        FROM questions q
        WHERE q.id = $1
      `;
      
      const updatedQuestionResult = await pool.query(updatedQuestionQuery, [id]);
      res.json(updatedQuestionResult.rows[0]);
    } else {
      // Return the updated question without modifying answer choices
      res.json(question);
    }
  } catch (error: any) {
    console.error(`Error updating question with ID ${req.params.id}:`, error);
    res.status(400).json({ message: error.message || 'Failed to update question' });
  }
});

// DELETE a question
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Delete all related answer choices first
    const deleteChoicesQuery = `
      DELETE FROM answer_choices
      WHERE question_id = $1
    `;
    
    await pool.query(deleteChoicesQuery, [id]);
    
    // Delete the question
    const deleteQuestionQuery = `
      DELETE FROM questions
      WHERE id = $1
      RETURNING id
    `;
    
    const result = await pool.query(deleteQuestionQuery, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.json({ id, message: 'Question deleted successfully' });
  } catch (error: any) {
    console.error(`Error deleting question with ID ${req.params.id}:`, error);
    res.status(500).json({ message: error.message || 'Failed to delete question' });
  }
});

export default router;