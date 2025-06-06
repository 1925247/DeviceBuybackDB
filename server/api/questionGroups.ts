import express, { Request, Response } from 'express';
import { pool } from '../db';
import { z } from 'zod';

const router = express.Router();

// GET all question groups with device type info and question counts
router.get('/', async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        qg.id, 
        qg.name, 
        qg.statement, 
        qg.device_type_id as "deviceTypeId", 
        qg.icon,
        qg.active,
        qg.created_at as "createdAt",
        qg.updated_at as "updatedAt",
        dt.name as "deviceTypeName",
        dt.slug as "deviceTypeSlug",
        (SELECT COUNT(*) FROM questions q WHERE q.group_id = qg.id) as "questionCount"
      FROM question_groups qg
      LEFT JOIN device_types dt ON qg.device_type_id = dt.id
      ORDER BY qg.id ASC
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
    
    // Get the question group with device type info
    const groupQuery = `
      SELECT 
        qg.*,
        qg.device_type_id as "deviceTypeId",
        dt.name as "deviceTypeName",
        dt.slug as "deviceTypeSlug"
      FROM question_groups qg
      LEFT JOIN device_types dt ON qg.device_type_id = dt.id
      WHERE qg.id = $1
    `;
    
    const groupResult = await pool.query(groupQuery, [id]);
    
    if (groupResult.rows.length === 0) {
      return res.status(404).json({ message: 'Question group not found' });
    }
    
    const group = groupResult.rows[0];
    
    // Get all questions in this group with their answer choices
    const questionsQuery = `
      SELECT q.*, 
      (
        SELECT json_agg(
          json_build_object(
            'id', ac.id,
            'questionId', ac.question_id,
            'answerText', ac.answer_text,
            'icon', ac.icon,
            'weightage', ac.weightage,
            'repairCost', ac.repair_cost,
            'isDefault', ac.is_default,
            'order', ac."order",
            'followUpAction', ac.follow_up_action,
            'createdAt', ac.created_at,
            'updatedAt', ac.updated_at
          )
        )
        FROM answer_choices ac
        WHERE ac.question_id = q.id
        ORDER BY ac."order"
      ) as answer_choices
      FROM questions q
      WHERE q.group_id = $1
      ORDER BY q."order" NULLS LAST
    `;
    
    const questionsResult = await pool.query(questionsQuery, [id]);
    group.questions = questionsResult.rows;
    
    res.json(group);
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
      statement: z.string().optional().nullable(),
      device_type_id: z.number().optional().nullable(),
      active: z.boolean().optional(),
      icon: z.string().optional().nullable()
    });
    
    const validatedData = schema.parse(req.body);
    
    const query = `
      INSERT INTO question_groups (name, statement, device_type_id, active, icon, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;
    
    const params = [
      validatedData.name,
      validatedData.statement || null,
      validatedData.device_type_id || null,
      validatedData.active !== undefined ? validatedData.active : true,
      validatedData.icon || null
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
      statement: z.string().optional().nullable(),
      device_type_id: z.number().optional().nullable(),
      active: z.boolean().optional(),
      icon: z.string().optional().nullable()
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
    
    if ('statement' in validatedData) {
      updates.push(`statement = $${paramIndex++}`);
      params.push(validatedData.statement);
    }
    
    if ('device_type_id' in validatedData) {
      updates.push(`device_type_id = $${paramIndex++}`);
      params.push(validatedData.device_type_id);
    }
    
    if ('active' in validatedData) {
      updates.push(`active = $${paramIndex++}`);
      params.push(validatedData.active);
    }
    
    if ('icon' in validatedData) {
      updates.push(`icon = $${paramIndex++}`);
      params.push(validatedData.icon);
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
    
    // First check if there are any questions in this group
    const checkQuery = `
      SELECT COUNT(*) as question_count
      FROM questions
      WHERE group_id = $1
    `;
    
    const checkResult = await pool.query(checkQuery, [id]);
    const questionCount = parseInt(checkResult.rows[0].question_count);
    
    if (questionCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete question group with ${questionCount} questions. Please delete or move the questions first.` 
      });
    }
    
    // Delete the question group
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