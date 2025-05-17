import express, { Request, Response } from 'express';
import { db } from '../db';
import { questions, answerChoices } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const router = express.Router();

// GET all questions
router.get('/', async (req: Request, res: Response) => {
  try {
    const groupId = req.query.groupId ? parseInt(req.query.groupId as string) : undefined;
    
    let query = db.select().from(questions);
    
    if (groupId) {
      query = query.where(eq(questions.groupId, groupId));
    }
    
    const questionsData = await query.orderBy(questions.groupId, questions.order);
    
    res.json(questionsData);
  } catch (error: any) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch questions' });
  }
});

// GET a specific question with its answer choices
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const questionId = parseInt(req.params.id);
    
    // Get the question
    const [question] = await db.select()
      .from(questions)
      .where(eq(questions.id, questionId));
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    // Get answer choices if applicable
    const answerChoicesData = await db.select()
      .from(answerChoices)
      .where(eq(answerChoices.questionId, questionId))
      .orderBy(answerChoices.order);
    
    // Return question with its answer choices
    res.json({
      ...question,
      answerChoices: answerChoicesData
    });
  } catch (error: any) {
    console.error(`Error fetching question ${req.params.id}:`, error);
    res.status(500).json({ message: error.message || 'Failed to fetch question' });
  }
});

// Create new question
router.post('/', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      questionText: z.string().min(1, 'Question text is required'),
      questionType: z.enum(['single_choice', 'multiple_choice', 'text', 'number', 'boolean']),
      groupId: z.number(),
      order: z.number().default(0),
      active: z.boolean().default(true),
      tooltip: z.string().optional(),
      required: z.boolean().default(true),
      answerChoices: z.array(z.object({
        text: z.string(),
        answerText: z.string().optional(),
        value: z.string().or(z.number()),
        order: z.number().default(0),
        impactMultiplier: z.number().default(1)
      })).optional()
    });
    
    const validatedData = schema.parse(req.body);
    
    // Start a transaction
    const result = await db.transaction(async (tx) => {
      // Insert the question
      const [newQuestion] = await tx.insert(questions)
        .values({
          questionText: validatedData.questionText,
          questionType: validatedData.questionType,
          groupId: validatedData.groupId,
          order: validatedData.order,
          active: validatedData.active,
          tooltip: validatedData.tooltip || null,
          required: validatedData.required,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      // Insert answer choices if provided
      let questionWithAnswers = newQuestion;
      
      if (validatedData.answerChoices && validatedData.answerChoices.length > 0) {
        const answerChoicesData = validatedData.answerChoices.map((choice, index) => ({
          questionId: newQuestion.id,
          text: choice.text,
          answerText: choice.answerText || null,
          value: String(choice.value),
          order: choice.order || index,
          impactMultiplier: choice.impactMultiplier || 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }));
        
        const newAnswerChoices = await tx.insert(answerChoices)
          .values(answerChoicesData)
          .returning();
        
        questionWithAnswers = {
          ...newQuestion,
          answerChoices: newAnswerChoices
        };
      }
      
      return questionWithAnswers;
    });
    
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Error creating question:', error);
    res.status(400).json({ message: error.message || 'Failed to create question' });
  }
});

// Update question
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const questionId = parseInt(req.params.id);
    
    const schema = z.object({
      questionText: z.string().min(1, 'Question text is required'),
      questionType: z.enum(['single_choice', 'multiple_choice', 'text', 'number', 'boolean']),
      groupId: z.number(),
      order: z.number(),
      active: z.boolean(),
      tooltip: z.string().optional(),
      required: z.boolean(),
      answerChoices: z.array(z.object({
        id: z.number().optional(), // Existing answer choice ID
        text: z.string(),
        answerText: z.string().optional(),
        value: z.string().or(z.number()),
        order: z.number().default(0),
        impactMultiplier: z.number().default(1),
        _delete: z.boolean().optional() // Mark for deletion
      })).optional()
    });
    
    const validatedData = schema.parse(req.body);
    
    // Start a transaction
    const result = await db.transaction(async (tx) => {
      // Check if question exists
      const [existingQuestion] = await tx.select()
        .from(questions)
        .where(eq(questions.id, questionId));
      
      if (!existingQuestion) {
        throw new Error('Question not found');
      }
      
      // Update the question
      const [updatedQuestion] = await tx.update(questions)
        .set({
          questionText: validatedData.questionText,
          questionType: validatedData.questionType,
          groupId: validatedData.groupId,
          order: validatedData.order,
          active: validatedData.active,
          tooltip: validatedData.tooltip || null,
          required: validatedData.required,
          updatedAt: new Date()
        })
        .where(eq(questions.id, questionId))
        .returning();
      
      // Handle answer choices
      if (validatedData.answerChoices) {
        // Get existing answer choices
        const existingChoices = await tx.select()
          .from(answerChoices)
          .where(eq(answerChoices.questionId, questionId));
        
        const existingChoiceIds = existingChoices.map(choice => choice.id);
        
        // Process each answer choice
        for (const choice of validatedData.answerChoices) {
          if (choice.id && choice._delete) {
            // Delete existing choice
            await tx.delete(answerChoices)
              .where(eq(answerChoices.id, choice.id));
          } else if (choice.id) {
            // Update existing choice
            await tx.update(answerChoices)
              .set({
                text: choice.text,
                answerText: choice.answerText || null,
                value: String(choice.value),
                order: choice.order,
                impactMultiplier: choice.impactMultiplier || 1,
                updatedAt: new Date()
              })
              .where(eq(answerChoices.id, choice.id));
          } else {
            // Insert new choice
            await tx.insert(answerChoices)
              .values({
                questionId: questionId,
                text: choice.text,
                answerText: choice.answerText || null,
                value: String(choice.value),
                order: choice.order,
                impactMultiplier: choice.impactMultiplier || 1,
                createdAt: new Date(),
                updatedAt: new Date()
              });
          }
        }
        
        // Delete choices not included in the update
        const updatedChoiceIds = validatedData.answerChoices
          .filter(c => c.id && !c._delete)
          .map(c => c.id as number);
        
        const choiceIdsToDelete = existingChoiceIds.filter(id => !updatedChoiceIds.includes(id));
        
        if (choiceIdsToDelete.length > 0) {
          await tx.delete(answerChoices)
            .where(and(
              eq(answerChoices.questionId, questionId),
              inArray(answerChoices.id, choiceIdsToDelete)
            ));
        }
      }
      
      // Get updated question with answer choices
      const [questionWithAnswers] = await tx.select()
        .from(questions)
        .where(eq(questions.id, questionId));
      
      const updatedAnswerChoices = await tx.select()
        .from(answerChoices)
        .where(eq(answerChoices.questionId, questionId))
        .orderBy(answerChoices.order);
      
      return {
        ...questionWithAnswers,
        answerChoices: updatedAnswerChoices
      };
    });
    
    res.json(result);
  } catch (error: any) {
    console.error(`Error updating question ${req.params.id}:`, error);
    res.status(400).json({ message: error.message || 'Failed to update question' });
  }
});

// Delete question
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const questionId = parseInt(req.params.id);
    
    // Start a transaction
    const result = await db.transaction(async (tx) => {
      // Check if question exists
      const [existingQuestion] = await tx.select()
        .from(questions)
        .where(eq(questions.id, questionId));
      
      if (!existingQuestion) {
        throw new Error('Question not found');
      }
      
      // Delete answer choices first
      await tx.delete(answerChoices)
        .where(eq(answerChoices.questionId, questionId));
      
      // Delete the question
      const [deletedQuestion] = await tx.delete(questions)
        .where(eq(questions.id, questionId))
        .returning();
      
      return deletedQuestion;
    });
    
    res.json(result);
  } catch (error: any) {
    console.error(`Error deleting question ${req.params.id}:`, error);
    res.status(500).json({ message: error.message || 'Failed to delete question' });
  }
});

// Helper function for 'in' array condition
function inArray(column: any, values: any[]) {
  return sql`${column} IN (${sql.join(values, sql`, `)})`;
}

export default router;