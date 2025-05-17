import express, { Request, Response } from 'express';
import { db } from '../db';
import { answerChoices } from '@shared/schema';
import { eq, asc } from 'drizzle-orm';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

const router = express.Router();

// Schema for creating/updating answer choices
const answerChoiceSchema = z.object({
  questionId: z.number(),
  answerText: z.string().min(1, "Answer text is required"),
  icon: z.string().nullable().optional(),
  weightage: z.number().default(0),
  repairCost: z.number().default(0),
  isDefault: z.boolean().default(false),
  order: z.number().default(0),
  followUpAction: z.string().nullable().optional(),
});

// Get all answer choices for a question
router.get('/:questionId', async (req: Request, res: Response) => {
  try {
    const questionId = parseInt(req.params.questionId);
    
    if (isNaN(questionId)) {
      return res.status(400).json({ message: "Invalid question ID" });
    }
    
    const choices = await db.select()
      .from(answerChoices)
      .where(eq(answerChoices.questionId, questionId))
      .orderBy(asc(answerChoices.order));
    
    return res.json(choices);
  } catch (error) {
    console.error("Error fetching answer choices:", error);
    return res.status(500).json({ message: "Failed to fetch answer choices" });
  }
});

// Create a new answer choice
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = answerChoiceSchema.parse(req.body);
    
    const [newChoice] = await db.insert(answerChoices)
      .values({
        questionId: validatedData.questionId,
        answerText: validatedData.answerText,
        icon: validatedData.icon,
        weightage: validatedData.weightage,
        repairCost: validatedData.repairCost,
        isDefault: validatedData.isDefault,
        order: validatedData.order,
        followUpAction: validatedData.followUpAction,
      })
      .returning();
    
    return res.status(201).json(newChoice);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedError = fromZodError(error);
      return res.status(400).json({ message: formattedError.message });
    }
    
    console.error("Error creating answer choice:", error);
    return res.status(500).json({ message: "Failed to create answer choice" });
  }
});

// Update an answer choice
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid answer choice ID" });
    }
    
    const validatedData = answerChoiceSchema.partial().parse(req.body);
    
    const [updatedChoice] = await db.update(answerChoices)
      .set({
        answerText: validatedData.answerText,
        icon: validatedData.icon,
        weightage: validatedData.weightage,
        repairCost: validatedData.repairCost,
        isDefault: validatedData.isDefault,
        order: validatedData.order,
        followUpAction: validatedData.followUpAction,
      })
      .where(eq(answerChoices.id, id))
      .returning();
    
    if (!updatedChoice) {
      return res.status(404).json({ message: "Answer choice not found" });
    }
    
    return res.json(updatedChoice);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedError = fromZodError(error);
      return res.status(400).json({ message: formattedError.message });
    }
    
    console.error("Error updating answer choice:", error);
    return res.status(500).json({ message: "Failed to update answer choice" });
  }
});

// Delete an answer choice
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid answer choice ID" });
    }
    
    const [deletedChoice] = await db.delete(answerChoices)
      .where(eq(answerChoices.id, id))
      .returning();
    
    if (!deletedChoice) {
      return res.status(404).json({ message: "Answer choice not found" });
    }
    
    return res.json({ success: true, message: "Answer choice deleted successfully" });
  } catch (error) {
    console.error("Error deleting answer choice:", error);
    return res.status(500).json({ message: "Failed to delete answer choice" });
  }
});

export default router;