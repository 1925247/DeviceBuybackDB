import express, { Request, Response } from 'express';
import { pool } from '../db';
import { z } from 'zod';

const router = express.Router();

// GET all questions with optional group filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const groupId = req.query.groupId ? parseInt(req.query.groupId as string) : null;
    
    let query = `
      SELECT q.*
      FROM questions q
    `;
    
    const queryParams = [];
    
    if (groupId) {
      query += ` WHERE q.group_id = $1`;
      queryParams.push(groupId);
    }
    
    query += ` ORDER BY q.id`;
    
    const result = await pool.query(query, queryParams);
    
    // Get answer choices for all questions in a separate query
    if (result.rows.length > 0) {
      const questionIds = result.rows.map(q => q.id);
      
      const choicesQuery = `
        SELECT * FROM answer_choices 
        WHERE question_id IN (${questionIds.join(',')})
        ORDER BY question_id, "order"
      `;
      
      const choicesResult = await pool.query(choicesQuery);
      
      // Attach answer choices to their corresponding questions
      const answerChoicesByQuestion = {};
      
      for (const choice of choicesResult.rows) {
        if (!answerChoicesByQuestion[choice.question_id]) {
          answerChoicesByQuestion[choice.question_id] = [];
        }
        answerChoicesByQuestion[choice.question_id].push(choice);
      }
      
      // Add answer choices to each question
      for (const question of result.rows) {
        question.answer_choices = answerChoicesByQuestion[question.id] || [];
      }
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
    
    const query = `
      SELECT q.*
      FROM questions q
      WHERE q.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    const question = result.rows[0];
    
    // Get answer choices for this question
    const choicesQuery = `
      SELECT * FROM answer_choices 
      WHERE question_id = $1
      ORDER BY "order"
    `;
    
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
    const schema = z.object({
      question_text: z.string(),
      group_id: z.number().optional().nullable(),
      active: z.boolean().optional().nullable(),
      question_type: z.string(),
      order: z.number().optional().nullable(),
      tooltip: z.string().optional().nullable(),
      required: z.boolean().optional().nullable(),
      answer_choices: z.array(
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
      RETURNING *
    `;
    
    const questionParams = [
      validatedData.question_text,
      validatedData.group_id || null,
      validatedData.active !== null ? validatedData.active : true,
      validatedData.question_type,
      validatedData.order !== null ? validatedData.order : 0,
      validatedData.tooltip || null,
      validatedData.required !== null ? validatedData.required : false
    ];
    
    const questionResult = await pool.query(questionQuery, questionParams);
    const question = questionResult.rows[0];
    
    // If there are answer choices, insert them
    if (validatedData.answer_choices && validatedData.answer_choices.length > 0) {
      const choicesValues = validatedData.answer_choices.map((choice, index) => {
        return `($1, $${index*4+2}, $${index*4+3}, $${index*4+4}, $${index*4+5}, NOW(), NOW())`;
      }).join(', ');
      
      const choicesParams = [question.id];
      validatedData.answer_choices.forEach(choice => {
        choicesParams.push(
          choice.text,
          choice.value,
          choice.order || 0,
          choice.impact || 0
        );
      });
      
      const choicesQuery = `
        INSERT INTO answer_choices (
          question_id, text, value, "order", impact, created_at, updated_at
        )
        VALUES ${choicesValues}
        RETURNING *
      `;
      
      const choicesResult = await pool.query(choicesQuery, choicesParams);
      question.answer_choices = choicesResult.rows;
    } else {
      question.answer_choices = [];
    }
    
    res.status(201).json(question);
  } catch (error: any) {
    console.error('Error creating question:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        message: 'Invalid question data', 
        details: error.errors 
      });
    }
    res.status(400).json({ message: error.message || 'Failed to create question' });
  }
});

// UPDATE a question
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Get the current question data
    const getQuery = `SELECT * FROM questions WHERE id = $1`;
    const getResult = await pool.query(getQuery, [id]);
    
    if (getResult.rows.length === 0) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    const currentQuestion = getResult.rows[0];
    
    const schema = z.object({
      question_text: z.string().optional(),
      group_id: z.number().optional().nullable(),
      active: z.boolean().optional().nullable(),
      question_type: z.string().optional(),
      order: z.number().optional().nullable(),
      tooltip: z.string().optional().nullable(),
      required: z.boolean().optional().nullable(),
      answer_choices: z.array(
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
      validatedData.question_text !== undefined ? validatedData.question_text : currentQuestion.question_text,
      validatedData.group_id !== undefined ? validatedData.group_id : currentQuestion.group_id,
      validatedData.active !== undefined ? validatedData.active : currentQuestion.active,
      validatedData.question_type !== undefined ? validatedData.question_type : currentQuestion.question_type,
      validatedData.order !== undefined ? validatedData.order : currentQuestion.order,
      validatedData.tooltip !== undefined ? validatedData.tooltip : currentQuestion.tooltip,
      validatedData.required !== undefined ? validatedData.required : currentQuestion.required,
      id
    ];
    
    const updateResult = await pool.query(updateQuery, updateParams);
    const updatedQuestion = updateResult.rows[0];
    
    // Handle answer choices if provided
    if (validatedData.answer_choices) {
      // Get existing answer choices
      const getChoicesQuery = `SELECT * FROM answer_choices WHERE question_id = $1`;
      const getChoicesResult = await pool.query(getChoicesQuery, [id]);
      const existingChoices = getChoicesResult.rows;
      
      // IDs of existing choices
      const existingIds = new Set(existingChoices.map(c => c.id));
      
      // New choices to insert
      const newChoices = validatedData.answer_choices.filter(c => !c.id || !existingIds.has(c.id));
      
      // Existing choices to update
      const choicesToUpdate = validatedData.answer_choices.filter(c => c.id && existingIds.has(c.id));
      
      // Delete choices that are not in the updated list
      const choiceIdsToKeep = new Set(choicesToUpdate.map(c => c.id));
      const choiceIdsToDelete = Array.from(existingIds).filter(id => !choiceIdsToKeep.has(id as number));
      
      if (choiceIdsToDelete.length > 0) {
        const deleteChoicesQuery = `
          DELETE FROM answer_choices 
          WHERE id IN (${choiceIdsToDelete.join(',')})
        `;
        await pool.query(deleteChoicesQuery);
      }
      
      // Update existing choices
      for (const choice of choicesToUpdate) {
        const updateChoiceQuery = `
          UPDATE answer_choices
          SET 
            text = $1,
            value = $2,
            "order" = $3,
            impact = $4,
            updated_at = NOW()
          WHERE id = $5
          RETURNING *
        `;
        
        await pool.query(updateChoiceQuery, [
          choice.text,
          choice.value,
          choice.order,
          choice.impact || 0,
          choice.id
        ]);
      }
      
      // Insert new choices
      if (newChoices.length > 0) {
        const choicesValues = newChoices.map((_, index) => {
          return `($1, $${index*4+2}, $${index*4+3}, $${index*4+4}, $${index*4+5}, NOW(), NOW())`;
        }).join(', ');
        
        const choicesParams = [id];
        newChoices.forEach(choice => {
          choicesParams.push(
            choice.text,
            choice.value,
            choice.order || 0,
            choice.impact || 0
          );
        });
        
        const insertChoicesQuery = `
          INSERT INTO answer_choices (
            question_id, text, value, "order", impact, created_at, updated_at
          )
          VALUES ${choicesValues}
          RETURNING *
        `;
        
        await pool.query(insertChoicesQuery, choicesParams);
      }
    }
    
    // Get the updated question with all choices
    const finalQuery = `
      SELECT q.*
      FROM questions q
      WHERE q.id = $1
    `;
    
    const finalResult = await pool.query(finalQuery, [id]);
    const finalQuestion = finalResult.rows[0];
    
    // Get answer choices for this question
    const finalChoicesQuery = `
      SELECT * FROM answer_choices 
      WHERE question_id = $1
      ORDER BY "order"
    `;
    
    const finalChoicesResult = await pool.query(finalChoicesQuery, [id]);
    finalQuestion.answer_choices = finalChoicesResult.rows;
    
    res.json(finalQuestion);
  } catch (error: any) {
    console.error(`Error updating question with ID ${req.params.id}:`, error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        message: 'Invalid question data', 
        details: error.errors 
      });
    }
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