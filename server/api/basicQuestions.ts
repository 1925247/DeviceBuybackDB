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
    
    // If questions exist, get their answer choices in a separate query
    if (result.rows.length > 0) {
      const questionIds = result.rows.map(q => q.id);
      
      const choicesQuery = `
        SELECT * FROM answer_choices 
        WHERE question_id IN (${questionIds.join(',')})
      `;
      
      const choicesResult = await pool.query(choicesQuery);
      
      // Organize answer choices by question_id
      const choicesByQuestion = {};
      choicesResult.rows.forEach(choice => {
        if (!choicesByQuestion[choice.question_id]) {
          choicesByQuestion[choice.question_id] = [];
        }
        choicesByQuestion[choice.question_id].push(choice);
      });
      
      // Attach answer choices to each question
      result.rows.forEach(question => {
        question.answer_choices = choicesByQuestion[question.id] || [];
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
    
    // Get answer choices for this question
    const choicesQuery = `SELECT * FROM answer_choices WHERE question_id = $1 ORDER BY "order"`;
    const choicesResult = await pool.query(choicesQuery, [id]);
    
    question.answer_choices = choicesResult.rows;
    
    res.json(question);
  } catch (error: any) {
    console.error(`Error fetching question with ID ${req.params.id}:`, error);
    res.status(500).json({ message: error.message || 'Failed to fetch question' });
  }
});

// CREATE a new question
router.post('/', async (req: Request, res: Response) => {
  try {
    // Start a transaction
    await pool.query('BEGIN');
    
    const { 
      question_text, 
      group_id, 
      active = true, 
      question_type, 
      order = 0, 
      tooltip = null, 
      required = false,
      answer_choices = []
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
    
    const questionResult = await pool.query(questionQuery, [
      question_text,
      group_id || null,
      active,
      question_type,
      order,
      tooltip,
      required
    ]);
    
    const newQuestion = questionResult.rows[0];
    
    // Insert answer choices if provided
    if (answer_choices && answer_choices.length > 0) {
      for (const choice of answer_choices) {
        const choiceQuery = `
          INSERT INTO answer_choices (
            question_id, text, value, "order", impact, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          RETURNING *
        `;
        
        await pool.query(choiceQuery, [
          newQuestion.id,
          choice.text,
          choice.value,
          choice.order || 0,
          choice.impact || 0
        ]);
      }
    }
    
    // Get the question with its answer choices
    const finalQuery = `SELECT * FROM questions WHERE id = $1`;
    const finalResult = await pool.query(finalQuery, [newQuestion.id]);
    
    const finalQuestion = finalResult.rows[0];
    
    // Get answer choices
    const finalChoicesQuery = `SELECT * FROM answer_choices WHERE question_id = $1 ORDER BY "order"`;
    const finalChoicesResult = await pool.query(finalChoicesQuery, [newQuestion.id]);
    
    finalQuestion.answer_choices = finalChoicesResult.rows;
    
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
      question_text, 
      group_id, 
      active, 
      question_type, 
      order, 
      tooltip, 
      required,
      answer_choices = []
    } = req.body;
    
    // Update the question
    const updateQuery = `
      UPDATE questions
      SET 
        question_text = COALESCE($1, question_text),
        group_id = COALESCE($2, group_id),
        active = COALESCE($3, active),
        question_type = COALESCE($4, question_type),
        "order" = COALESCE($5, "order"),
        tooltip = COALESCE($6, tooltip),
        required = COALESCE($7, required),
        updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `;
    
    const updateResult = await pool.query(updateQuery, [
      question_text,
      group_id,
      active,
      question_type,
      order,
      tooltip,
      required,
      id
    ]);
    
    // Handle answer choices if provided
    if (answer_choices && answer_choices.length > 0) {
      // Delete existing answer choices
      await pool.query(`DELETE FROM answer_choices WHERE question_id = $1`, [id]);
      
      // Insert new answer choices
      for (const choice of answer_choices) {
        const choiceQuery = `
          INSERT INTO answer_choices (
            question_id, text, value, "order", impact, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        `;
        
        await pool.query(choiceQuery, [
          id,
          choice.text,
          choice.value,
          choice.order || 0,
          choice.impact || 0
        ]);
      }
    }
    
    // Get the updated question with its answer choices
    const finalQuery = `SELECT * FROM questions WHERE id = $1`;
    const finalResult = await pool.query(finalQuery, [id]);
    
    const updatedQuestion = finalResult.rows[0];
    
    // Get updated answer choices
    const choicesQuery = `SELECT * FROM answer_choices WHERE question_id = $1 ORDER BY "order"`;
    const choicesResult = await pool.query(choicesQuery, [id]);
    
    updatedQuestion.answer_choices = choicesResult.rows;
    
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