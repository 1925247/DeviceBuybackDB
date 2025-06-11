import { Router } from 'express';
import { db } from '../db.js';
import { questions, answerChoices, questionGroups } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all questions with their answer choices
router.get('/', async (_req, res) => {
  try {
    const result = await db
      .select({
        id: questions.id,
        questionText: questions.questionText,
        questionType: questions.questionType,
        order: questions.order,
        active: questions.active,
        tooltip: questions.tooltip,
        required: questions.required,
        groupId: questions.groupId,
        groupName: questionGroups.name,
        createdAt: questions.createdAt,
        updatedAt: questions.updatedAt
      })
      .from(questions)
      .leftJoin(questionGroups, eq(questions.groupId, questionGroups.id))
      .where(eq(questions.active, true));
    
    // Get answer choices for all questions
    const choices = await db.select().from(answerChoices);
    
    // Group choices by question ID
    const choicesByQuestion = choices.reduce((acc, choice) => {
      if (!acc[choice.questionId]) {
        acc[choice.questionId] = [];
      }
      acc[choice.questionId].push(choice);
      return acc;
    }, {});
    
    // Add choices to questions
    const questionsWithChoices = result.map(question => ({
      ...question,
      answerChoices: choicesByQuestion[question.id] || []
    }));
    
    res.json(questionsWithChoices);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Failed to fetch questions' });
  }
});

// Get question by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const question = await db
      .select({
        id: questions.id,
        questionText: questions.questionText,
        questionType: questions.questionType,
        order: questions.order,
        active: questions.active,
        tooltip: questions.tooltip,
        required: questions.required,
        groupId: questions.groupId,
        groupName: questionGroups.name,
        createdAt: questions.createdAt,
        updatedAt: questions.updatedAt
      })
      .from(questions)
      .leftJoin(questionGroups, eq(questions.groupId, questionGroups.id))
      .where(eq(questions.id, parseInt(id)))
      .limit(1);
    
    if (!question.length) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    // Get answer choices for this question
    const choices = await db.select().from(answerChoices).where(eq(answerChoices.questionId, parseInt(id)));
    
    res.json({
      ...question[0],
      answerChoices: choices
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ message: 'Failed to fetch question' });
  }
});

// Create new question
router.post('/', async (req, res) => {
  try {
    const result = await db.insert(questions).values(req.body).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ message: 'Failed to create question' });
  }
});

// Update question
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db
      .update(questions)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(questions.id, parseInt(id)))
      .returning();
    
    if (!result.length) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ message: 'Failed to update question' });
  }
});

// Delete question
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.delete(questions).where(eq(questions.id, parseInt(id))).returning();
    
    if (!result.length) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ message: 'Failed to delete question' });
  }
});

export default router;