import express, { Request, Response } from 'express';
import { pool } from '../db';
import { z } from 'zod';

const router = express.Router();

// GET all answer choices for a question
router.get('/:questionId', async (req: Request, res: Response) => {
  try {
    const questionId = parseInt(req.params.questionId);
    
    const query = `
      SELECT * FROM answer_choices
      WHERE question_id = $1
      ORDER BY "order"
    `;
    
    const result = await pool.query(query, [questionId]);
    
    // Transform snake_case to camelCase for frontend consumption
    const formattedAnswers = result.rows.map(row => ({
      id: row.id,
      questionId: row.question_id,
      answerText: row.answer_text,
      icon: row.icon,
      weightage: row.weightage,
      repairCost: row.repair_cost,
      isDefault: row.is_default,
      order: row.order,
      followUpAction: row.follow_up_action,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    
    res.json(formattedAnswers);
  } catch (error: any) {
    console.error('Error fetching answer choices:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch answer choices' });
  }
});

// POST create a new answer choice
router.post('/', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      questionId: z.number(),
      answerText: z.string().min(1, "Answer text is required"),
      icon: z.string().optional(),
      weightage: z.number().default(0),
      repairCost: z.number().default(0),
      isDefault: z.boolean().default(false),
      order: z.number().default(0),
      followUpAction: z.any().optional()
    });
    
    const validatedData = schema.parse(req.body);
    
    // Check if this is set as default and other choices exist
    if (validatedData.isDefault) {
      // If setting this as default, unset any existing defaults for this question
      await pool.query(
        `UPDATE answer_choices SET is_default = false WHERE question_id = $1`,
        [validatedData.questionId]
      );
    }
    
    const query = `
      INSERT INTO answer_choices (
        question_id, 
        answer_text, 
        icon, 
        weightage, 
        repair_cost, 
        is_default, 
        "order", 
        follow_up_action,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `;
    
    const values = [
      validatedData.questionId,
      validatedData.answerText,
      validatedData.icon || null,
      validatedData.weightage,
      validatedData.repairCost,
      validatedData.isDefault,
      validatedData.order,
      validatedData.followUpAction || null
    ];
    
    const result = await pool.query(query, values);
    
    // Format the response
    const newAnswer = {
      id: result.rows[0].id,
      questionId: result.rows[0].question_id,
      answerText: result.rows[0].answer_text,
      icon: result.rows[0].icon,
      weightage: result.rows[0].weightage,
      repairCost: result.rows[0].repair_cost,
      isDefault: result.rows[0].is_default,
      order: result.rows[0].order,
      followUpAction: result.rows[0].follow_up_action,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };
    
    res.status(201).json(newAnswer);
  } catch (error: any) {
    console.error('Error creating answer choice:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Invalid data provided', details: error.errors });
    }
    
    res.status(500).json({ message: error.message || 'Failed to create answer choice' });
  }
});

// PATCH update an answer choice
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // First, retrieve the current answer choice
    const getQuery = `SELECT * FROM answer_choices WHERE id = $1`;
    const getResult = await pool.query(getQuery, [id]);
    
    if (getResult.rows.length === 0) {
      return res.status(404).json({ message: 'Answer choice not found' });
    }
    
    const currentAnswer = getResult.rows[0];
    
    const schema = z.object({
      answerText: z.string().min(1).optional(),
      icon: z.string().optional().nullable(),
      weightage: z.number().optional(),
      repairCost: z.number().optional(),
      isDefault: z.boolean().optional(),
      order: z.number().optional(),
      followUpAction: z.any().optional().nullable()
    });
    
    const validatedData = schema.parse(req.body);
    
    // Check if this is set as default and other choices exist
    if (validatedData.isDefault && !currentAnswer.is_default) {
      // If setting this as default, unset any existing defaults for this question
      await pool.query(
        `UPDATE answer_choices SET is_default = false WHERE question_id = $1`,
        [currentAnswer.question_id]
      );
    }
    
    // Build update query based on provided fields
    const updateFields = [];
    const queryParams = [id];
    let paramIndex = 2;
    
    if (validatedData.answerText !== undefined) {
      updateFields.push(`answer_text = $${paramIndex++}`);
      queryParams.push(validatedData.answerText);
    }
    
    if (validatedData.icon !== undefined) {
      updateFields.push(`icon = $${paramIndex++}`);
      queryParams.push(validatedData.icon);
    }
    
    if (validatedData.weightage !== undefined) {
      updateFields.push(`weightage = $${paramIndex++}`);
      queryParams.push(validatedData.weightage);
    }
    
    if (validatedData.repairCost !== undefined) {
      updateFields.push(`repair_cost = $${paramIndex++}`);
      queryParams.push(validatedData.repairCost);
    }
    
    if (validatedData.isDefault !== undefined) {
      updateFields.push(`is_default = $${paramIndex++}`);
      queryParams.push(validatedData.isDefault);
    }
    
    if (validatedData.order !== undefined) {
      updateFields.push(`"order" = $${paramIndex++}`);
      queryParams.push(validatedData.order);
    }
    
    if (validatedData.followUpAction !== undefined) {
      updateFields.push(`follow_up_action = $${paramIndex++}`);
      queryParams.push(validatedData.followUpAction);
    }
    
    // Add updated_at timestamp
    updateFields.push(`updated_at = NOW()`);
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update provided' });
    }
    
    const updateQuery = `
      UPDATE answer_choices
      SET ${updateFields.join(', ')}
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, queryParams);
    
    // Format the response
    const updatedAnswer = {
      id: result.rows[0].id,
      questionId: result.rows[0].question_id,
      answerText: result.rows[0].answer_text,
      icon: result.rows[0].icon,
      weightage: result.rows[0].weightage,
      repairCost: result.rows[0].repair_cost,
      isDefault: result.rows[0].is_default,
      order: result.rows[0].order,
      followUpAction: result.rows[0].follow_up_action,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };
    
    res.json(updatedAnswer);
  } catch (error: any) {
    console.error('Error updating answer choice:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Invalid data provided', details: error.errors });
    }
    
    res.status(500).json({ message: error.message || 'Failed to update answer choice' });
  }
});

// DELETE delete an answer choice
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // First, get the answer choice details for the response
    const getQuery = `SELECT * FROM answer_choices WHERE id = $1`;
    const getResult = await pool.query(getQuery, [id]);
    
    if (getResult.rows.length === 0) {
      return res.status(404).json({ message: 'Answer choice not found' });
    }
    
    const answerChoice = getResult.rows[0];
    
    // Delete the answer choice
    const deleteQuery = `DELETE FROM answer_choices WHERE id = $1`;
    await pool.query(deleteQuery, [id]);
    
    // Format the response
    const deletedAnswer = {
      id: answerChoice.id,
      questionId: answerChoice.question_id,
      answerText: answerChoice.answer_text,
      message: 'Answer choice deleted successfully'
    };
    
    res.json(deletedAnswer);
  } catch (error: any) {
    console.error('Error deleting answer choice:', error);
    res.status(500).json({ message: error.message || 'Failed to delete answer choice' });
  }
});

export default router;