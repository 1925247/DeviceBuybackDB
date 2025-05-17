import express, { Request, Response } from 'express';
import { pool } from '../db';
import { z } from 'zod';

const router = express.Router();

// GET all question groups - simplified version
router.get('/', async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT * FROM question_groups
      ORDER BY id
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching question groups:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch question groups' });
  }
});

// GET a single question group by ID with its questions
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    const groupQuery = `
      SELECT * FROM question_groups
      WHERE id = $1
    `;
    
    const questionsQuery = `
      SELECT * FROM questions
      WHERE group_id = $1
      ORDER BY "order"
    `;
    
    const [groupResult, questionsResult] = await Promise.all([
      pool.query(groupQuery, [id]),
      pool.query(questionsQuery, [id])
    ]);
    
    if (groupResult.rows.length === 0) {
      return res.status(404).json({ message: 'Question group not found' });
    }
    
    const group = groupResult.rows[0];
    const questions = questionsResult.rows;
    
    // Get answer choices for all questions
    const questionIds = questions.map(q => q.id);
    
    if (questionIds.length > 0) {
      const answersQuery = `
        SELECT * FROM answer_choices
        WHERE question_id IN (${questionIds.join(',')})
        ORDER BY question_id, "order"
      `;
      
      const answersResult = await pool.query(answersQuery);
      const answers = answersResult.rows;
      
      // Attach answer choices to their questions
      questions.forEach(question => {
        question.answer_choices = answers.filter(a => a.question_id === question.id);
      });
    }
    
    // Create response with group and its questions
    const response = {
      ...group,
      questions
    };
    
    res.json(response);
  } catch (error: any) {
    console.error(`Error fetching question group with ID ${req.params.id}:`, error);
    res.status(500).json({ message: error.message || 'Failed to fetch question group' });
  }
});

// CREATE a new question group
router.post('/', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      name: z.string(),
      device_type_id: z.number().optional(),
      statement: z.string().optional(),
      active: z.boolean().optional()
    });
    
    const validatedData = schema.parse(req.body);
    
    const query = `
      INSERT INTO question_groups (name, device_type_id, statement, active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `;
    
    const params = [
      validatedData.name,
      validatedData.device_type_id || null,
      validatedData.statement || null,
      validatedData.active !== undefined ? validatedData.active : true
    ];
    
    const result = await pool.query(query, params);
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating question group:', error);
    res.status(400).json({ message: error.message || 'Failed to create question group' });
  }
});

// UPDATE a question group
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    const schema = z.object({
      name: z.string().optional(),
      device_type_id: z.number().optional().nullable(),
      statement: z.string().optional().nullable(),
      active: z.boolean().optional()
    });
    
    const validatedData = schema.parse(req.body);
    
    // Build the SET clause for the UPDATE query
    const updates = [];
    const params = [id]; // First parameter is the group ID
    let paramIndex = 2;
    
    if ('name' in validatedData) {
      updates.push(`name = $${paramIndex++}`);
      params.push(validatedData.name);
    }
    
    if ('device_type_id' in validatedData) {
      updates.push(`device_type_id = $${paramIndex++}`);
      params.push(validatedData.device_type_id);
    }
    
    if ('statement' in validatedData) {
      updates.push(`statement = $${paramIndex++}`);
      params.push(validatedData.statement);
    }
    
    if ('active' in validatedData) {
      updates.push(`active = $${paramIndex++}`);
      params.push(validatedData.active);
    }
    
    updates.push(`updated_at = NOW()`);
    
    if (updates.length === 1) {
      // Only updated_at is being updated, nothing else changed
      return res.status(304).json({ message: 'No changes to update' });
    }
    
    const query = `
      UPDATE question_groups
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Question group not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error(`Error updating question group with ID ${req.params.id}:`, error);
    res.status(400).json({ message: error.message || 'Failed to update question group' });
  }
});

// DELETE a question group
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if there are any questions in this group
    const checkQuery = `
      SELECT COUNT(*) FROM questions WHERE group_id = $1
    `;
    
    const checkResult = await pool.query(checkQuery, [id]);
    const questionCount = parseInt(checkResult.rows[0].count);
    
    if (questionCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete group with ${questionCount} questions. Delete questions first or reassign them to another group.` 
      });
    }
    
    // Delete the group
    const deleteQuery = `
      DELETE FROM question_groups
      WHERE id = $1
      RETURNING id
    `;
    
    const result = await pool.query(deleteQuery, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Question group not found' });
    }
    
    res.json({ id, message: 'Question group deleted successfully' });
  } catch (error: any) {
    console.error(`Error deleting question group with ID ${req.params.id}:`, error);
    res.status(500).json({ message: error.message || 'Failed to delete question group' });
  }
});

export default router;