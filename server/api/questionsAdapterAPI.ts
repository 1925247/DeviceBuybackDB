import express, { Request, Response } from 'express';
import { pool } from '../db';

const router = express.Router();

// Maps client-side field names to database field names
function mapClientToDatabase(data: any) {
  if (!data) return null;
  
  const mappedData = {
    question_text: data.questionText,
    group_id: data.groupId,
    active: data.active,
    question_type: data.questionType,
    order: data.order,
    tooltip: data.tooltip,
    required: data.required
  };
  
  // Map answer choices if they exist
  if (data.answerChoices && Array.isArray(data.answerChoices)) {
    const mappedChoices = data.answerChoices.map((choice: any) => ({
      id: choice.id,
      text: choice.answerText,
      value: choice.answerText.toLowerCase().replace(/\s+/g, '_'),
      order: choice.order || 0,
      impact: choice.weightage || 0,
      is_default: choice.isDefault
    }));
    
    return {
      ...mappedData,
      answer_choices: mappedChoices
    };
  }
  
  return mappedData;
}

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
      const choicesByQuestion = {};
      choicesResult.rows.forEach(choice => {
        if (!choicesByQuestion[choice.question_id]) {
          choicesByQuestion[choice.question_id] = [];
        }
        choicesByQuestion[choice.question_id].push(choice);
      });
      
      // Map database column names to client-side expected names
      result.rows.forEach(question => {
        question.questionText = question.question_text;
        question.questionType = question.question_type;
        question.groupId = question.group_id;
        question.answerChoices = (choicesByQuestion[question.id] || []).map(choice => ({
          id: choice.id,
          answerText: choice.text,
          icon: choice.icon,
          weightage: choice.impact,
          repairCost: choice.repair_cost || 0,
          isDefault: choice.is_default,
          followUpAction: choice.follow_up_action,
          order: choice.order
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
    
    // Map database column names to client-side expected names
    question.questionText = question.question_text;
    question.questionType = question.question_type;
    question.groupId = question.group_id;
    question.answerChoices = choicesResult.rows.map(choice => ({
      id: choice.id,
      answerText: choice.text,
      icon: choice.icon,
      weightage: choice.impact,
      repairCost: choice.repair_cost || 0,
      isDefault: choice.is_default,
      followUpAction: choice.follow_up_action,
      order: choice.order
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
    // Start a transaction
    await pool.query('BEGIN');
    
    // Map client-side field names to database field names
    const dbData = mapClientToDatabase(req.body);
    
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
      dbData.question_text,
      dbData.group_id || null,
      dbData.active,
      dbData.question_type,
      dbData.order || 0,
      dbData.tooltip,
      dbData.required
    ]);
    
    const newQuestion = questionResult.rows[0];
    
    // Insert answer choices if provided
    if (dbData.answer_choices && dbData.answer_choices.length > 0) {
      for (let i = 0; i < dbData.answer_choices.length; i++) {
        const choice = dbData.answer_choices[i];
        const choiceQuery = `
          INSERT INTO answer_choices (
            question_id, text, value, "order", impact, is_default, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
          RETURNING *
        `;
        
        await pool.query(choiceQuery, [
          newQuestion.id,
          choice.text,
          choice.value,
          i, // Use index as order if not provided
          choice.impact || 0,
          choice.is_default || false
        ]);
      }
    }
    
    // Get the complete question with its answer choices
    const finalQuery = `SELECT * FROM questions WHERE id = $1`;
    const finalResult = await pool.query(finalQuery, [newQuestion.id]);
    
    const finalQuestion = finalResult.rows[0];
    
    // Get answer choices
    const finalChoicesQuery = `SELECT * FROM answer_choices WHERE question_id = $1 ORDER BY "order"`;
    const finalChoicesResult = await pool.query(finalChoicesQuery, [newQuestion.id]);
    
    // Map database column names to client-side expected names
    finalQuestion.questionText = finalQuestion.question_text;
    finalQuestion.questionType = finalQuestion.question_type;
    finalQuestion.groupId = finalQuestion.group_id;
    finalQuestion.answerChoices = finalChoicesResult.rows.map(choice => ({
      id: choice.id,
      answerText: choice.text,
      icon: choice.icon,
      weightage: choice.impact,
      repairCost: choice.repair_cost || 0,
      isDefault: choice.is_default,
      followUpAction: choice.follow_up_action,
      order: choice.order
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
    
    // Map client-side field names to database field names
    const dbData = mapClientToDatabase(req.body);
    
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
      dbData.question_text,
      dbData.group_id,
      dbData.active,
      dbData.question_type,
      dbData.order,
      dbData.tooltip,
      dbData.required,
      id
    ]);
    
    // Handle answer choices if provided
    if (dbData.answer_choices && dbData.answer_choices.length > 0) {
      // Delete existing answer choices
      await pool.query(`DELETE FROM answer_choices WHERE question_id = $1`, [id]);
      
      // Insert updated answer choices
      for (let i = 0; i < dbData.answer_choices.length; i++) {
        const choice = dbData.answer_choices[i];
        const choiceQuery = `
          INSERT INTO answer_choices (
            question_id, text, value, "order", impact, is_default, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
          RETURNING *
        `;
        
        await pool.query(choiceQuery, [
          id,
          choice.text,
          choice.value,
          i, // Use index as order if not provided
          choice.impact || 0,
          choice.is_default || false
        ]);
      }
    }
    
    // Get the updated question with its answer choices
    const finalQuery = `SELECT * FROM questions WHERE id = $1`;
    const finalResult = await pool.query(finalQuery, [id]);
    
    const updatedQuestion = finalResult.rows[0];
    
    // Get answer choices
    const choicesQuery = `SELECT * FROM answer_choices WHERE question_id = $1 ORDER BY "order"`;
    const choicesResult = await pool.query(choicesQuery, [id]);
    
    // Map database column names to client-side expected names
    updatedQuestion.questionText = updatedQuestion.question_text;
    updatedQuestion.questionType = updatedQuestion.question_type;
    updatedQuestion.groupId = updatedQuestion.group_id;
    updatedQuestion.answerChoices = choicesResult.rows.map(choice => ({
      id: choice.id,
      answerText: choice.text,
      icon: choice.icon,
      weightage: choice.impact,
      repairCost: choice.repair_cost || 0,
      isDefault: choice.is_default,
      followUpAction: choice.follow_up_action,
      order: choice.order
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