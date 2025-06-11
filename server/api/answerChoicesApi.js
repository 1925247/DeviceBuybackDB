import { Router } from 'express';
import { db } from '../db.js';
import { answerChoices, questions } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all answer choices
router.get('/', async (_req, res) => {
  try {
    const result = await db
      .select({
        id: answerChoices.id,
        questionId: answerChoices.questionId,
        answerText: answerChoices.answerText,
        icon: answerChoices.icon,
        weightage: answerChoices.weightage,
        repairCost: answerChoices.repairCost,
        isDefault: answerChoices.isDefault,
        order: answerChoices.order,
        questionText: questions.questionText,
        createdAt: answerChoices.createdAt,
        updatedAt: answerChoices.updatedAt
      })
      .from(answerChoices)
      .leftJoin(questions, eq(answerChoices.questionId, questions.id));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching answer choices:', error);
    res.status(500).json({ message: 'Failed to fetch answer choices' });
  }
});

// Get answer choices by question ID
router.get('/question/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    const result = await db
      .select()
      .from(answerChoices)
      .where(eq(answerChoices.questionId, parseInt(questionId)))
      .orderBy(answerChoices.order);
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching answer choices for question:', error);
    res.status(500).json({ message: 'Failed to fetch answer choices' });
  }
});

// Get answer choice by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const choice = await db.select().from(answerChoices).where(eq(answerChoices.id, parseInt(id))).limit(1);
    
    if (!choice.length) {
      return res.status(404).json({ message: 'Answer choice not found' });
    }
    
    res.json(choice[0]);
  } catch (error) {
    console.error('Error fetching answer choice:', error);
    res.status(500).json({ message: 'Failed to fetch answer choice' });
  }
});

// Create new answer choice
router.post('/', async (req, res) => {
  try {
    const result = await db.insert(answerChoices).values(req.body).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating answer choice:', error);
    res.status(500).json({ message: 'Failed to create answer choice' });
  }
});

// Update answer choice
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db
      .update(answerChoices)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(answerChoices.id, parseInt(id)))
      .returning();
    
    if (!result.length) {
      return res.status(404).json({ message: 'Answer choice not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating answer choice:', error);
    res.status(500).json({ message: 'Failed to update answer choice' });
  }
});

// Delete answer choice
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.delete(answerChoices).where(eq(answerChoices.id, parseInt(id))).returning();
    
    if (!result.length) {
      return res.status(404).json({ message: 'Answer choice not found' });
    }
    
    res.json({ message: 'Answer choice deleted successfully' });
  } catch (error) {
    console.error('Error deleting answer choice:', error);
    res.status(500).json({ message: 'Failed to delete answer choice' });
  }
});

export default router;