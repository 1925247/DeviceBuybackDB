import express, { Request, Response } from 'express';
import { pool } from '../db';
import { z } from 'zod';

const router = express.Router();

// GET all question groups
router.get('/', async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT g.id, g.name, g.active, g.device_type_id, g.statement, g.icon, g.created_at, g.updated_at,
      (
        SELECT json_agg(
          json_build_object(
            'id', q.id,
            'questionText', q.question_text,
            'groupId', q.group_id,
            'active', q.active,
            'questionType', q.question_type,
            'order', q."order",
            'tooltip', q.tooltip,
            'required', q.required,
            'createdAt', q.created_at,
            'updatedAt', q.updated_at,
            'answerChoices', (
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
            )
          )
        )
        FROM questions q
        WHERE q.group_id = g.id
      ) as questions
      FROM question_groups g
      ORDER BY g.id
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching question groups:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch question groups' });
  }
});

// GET a single question group by ID with all its questions
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    const query = `
      SELECT g.*,
      (
        SELECT json_agg(
          json_build_object(
            'id', q.id,
            'questionText', q.question_text,
            'groupId', q.group_id,
            'active', q.active,
            'questionType', q.question_type,
            'order', q.order,
            'tooltip', q.tooltip,
            'required', q.required,
            'createdAt', q.created_at,
            'updatedAt', q.updated_at,
            'answerChoices', (
              SELECT json_agg(
                json_build_object(
                  'id', ac.id,
                  'questionId', ac.question_id,
                  'text', ac.text,
                  'value', ac.value,
                  'order', ac.order,
                  'impactMultiplier', ac.impact_multiplier,
                  'createdAt', ac.created_at,
                  'updatedAt', ac.updated_at
                )
              )
              FROM answer_choices ac
              WHERE ac.question_id = q.id
            )
          )
        )
        FROM questions q
        WHERE q.group_id = g.id
      ) as questions
      FROM question_groups g
      WHERE g.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Question group not found' });
    }
    
    res.json(result.rows[0]);
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
      description: z.string().optional().nullable(),
      active: z.boolean().optional().nullable()
    });
    
    const validatedData = schema.parse(req.body);
    
    const query = `
      INSERT INTO question_groups (name, description, active, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING id, name, description, active, created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const params = [
      validatedData.name,
      validatedData.description || null,
      validatedData.active !== null ? validatedData.active : true
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
      description: z.string().optional().nullable(),
      active: z.boolean().optional().nullable()
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
    
    if ('description' in validatedData) {
      updates.push(`description = $${paramIndex++}`);
      params.push(validatedData.description);
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
      RETURNING id, name, description, active, created_at as "createdAt", updated_at as "updatedAt"
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