import express, { Request, Response } from 'express';
import { pool } from '../db';
import { z } from 'zod';

const router = express.Router();

// GET all question groups
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
    
    // Get the question group
    const groupQuery = `
      SELECT * FROM question_groups 
      WHERE id = $1
    `;
    
    const groupResult = await pool.query(groupQuery, [id]);
    
    if (groupResult.rows.length === 0) {
      return res.status(404).json({ message: 'Question group not found' });
    }
    
    const group = groupResult.rows[0];
    
    // Get all questions in this group
    const questionsQuery = `
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
      WHERE q.group_id = $1
      ORDER BY q."order"
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
    
    // First get the current data
    const currentQuery = `SELECT * FROM question_groups WHERE id = $1`;
    const currentResult = await pool.query(currentQuery, [id]);
    
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Question group not found' });
    }
    
    const currentData = currentResult.rows[0];
    
    // Prepare update query with all fields (update only those that changed)
    const updateQuery = `
      UPDATE question_groups
      SET 
        name = $1,
        statement = $2,
        device_type_id = $3,
        active = $4,
        icon = $5,
        updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `;
    
    // Use provided values or fallback to current values
    const params = [
      validatedData.name !== undefined ? validatedData.name : currentData.name,
      validatedData.statement !== undefined ? validatedData.statement : currentData.statement,
      validatedData.device_type_id !== undefined ? validatedData.device_type_id : currentData.device_type_id,
      validatedData.active !== undefined ? validatedData.active : currentData.active,
      validatedData.icon !== undefined ? validatedData.icon : currentData.icon,
      id
    ];
    
    const result = await pool.query(updateQuery, params);
    
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