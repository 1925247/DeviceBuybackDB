import express, { Request, Response } from 'express';
import { db } from '../db';
import { questionGroups, questions, productQuestionMappings } from '@shared/schema';
import { eq, and, count } from 'drizzle-orm';
import { z } from 'zod';

const router = express.Router();

// GET all question groups
router.get('/', async (req: Request, res: Response) => {
  try {
    // Get groups with question counts
    const groupsWithQuestionsCount = await db.select({
      id: questionGroups.id,
      name: questionGroups.name,
      statement: questionGroups.statement,
      deviceTypeId: questionGroups.deviceTypeId,
      icon: questionGroups.icon,
      active: questionGroups.active,
      createdAt: questionGroups.createdAt,
      updatedAt: questionGroups.updatedAt,
    })
    .from(questionGroups)
    .orderBy(questionGroups.id);

    // For each group, fetch the question count
    const result = await Promise.all(
      groupsWithQuestionsCount.map(async (group) => {
        const questionsCount = await db.select({
          count: count()
        })
        .from(questions)
        .where(eq(questions.groupId, group.id));
        
        return {
          ...group,
          questionsCount: questionsCount[0]?.count || 0
        };
      })
    );

    res.json(result);
  } catch (error: any) {
    console.error('Error fetching question groups:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch question groups' });
  }
});

// GET a specific question group with its questions
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const groupId = parseInt(req.params.id);
    
    // Get the group details
    const [group] = await db.select()
      .from(questionGroups)
      .where(eq(questionGroups.id, groupId));
    
    if (!group) {
      return res.status(404).json({ message: 'Question group not found' });
    }
    
    // Get all questions for this group with their answer choices
    const questionsData = await db.select({
      id: questions.id,
      questionText: questions.questionText,
      questionType: questions.questionType,
      groupId: questions.groupId,
      order: questions.order,
      active: questions.active,
      tooltip: questions.tooltip,
      required: questions.required,
      createdAt: questions.createdAt,
      updatedAt: questions.updatedAt
    })
    .from(questions)
    .where(eq(questions.groupId, groupId))
    .orderBy(questions.order);
    
    // Return group with its questions
    res.json({
      ...group,
      questions: questionsData
    });
  } catch (error: any) {
    console.error(`Error fetching question group ${req.params.id}:`, error);
    res.status(500).json({ message: error.message || 'Failed to fetch question group' });
  }
});

// Create new question group
router.post('/', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().min(1, 'Name is required'),
      statement: z.string().optional(),
      deviceTypeId: z.number().nullable().optional(),
      icon: z.string().optional(),
      active: z.boolean().default(true)
    });
    
    const validatedData = schema.parse(req.body);
    
    const [newGroup] = await db.insert(questionGroups)
      .values({
        name: validatedData.name,
        statement: validatedData.statement || '',
        deviceTypeId: validatedData.deviceTypeId,
        icon: validatedData.icon,
        active: validatedData.active,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    res.status(201).json(newGroup);
  } catch (error: any) {
    console.error('Error creating question group:', error);
    res.status(400).json({ message: error.message || 'Failed to create question group' });
  }
});

// Update question group
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const groupId = parseInt(req.params.id);
    
    const schema = z.object({
      name: z.string().min(1, 'Name is required'),
      statement: z.string().optional(),
      deviceTypeId: z.number().nullable().optional(),
      icon: z.string().optional(),
      active: z.boolean().default(true)
    });
    
    const validatedData = schema.parse(req.body);
    
    // Check if group exists
    const [existingGroup] = await db.select()
      .from(questionGroups)
      .where(eq(questionGroups.id, groupId));
    
    if (!existingGroup) {
      return res.status(404).json({ message: 'Question group not found' });
    }
    
    // Update the group
    const [updatedGroup] = await db.update(questionGroups)
      .set({
        name: validatedData.name,
        statement: validatedData.statement || existingGroup.statement,
        deviceTypeId: validatedData.deviceTypeId,
        icon: validatedData.icon,
        active: validatedData.active,
        updatedAt: new Date()
      })
      .where(eq(questionGroups.id, groupId))
      .returning();
    
    res.json(updatedGroup);
  } catch (error: any) {
    console.error(`Error updating question group ${req.params.id}:`, error);
    res.status(400).json({ message: error.message || 'Failed to update question group' });
  }
});

// Delete question group
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const groupId = parseInt(req.params.id);
    
    // Check if group exists
    const [existingGroup] = await db.select()
      .from(questionGroups)
      .where(eq(questionGroups.id, groupId));
    
    if (!existingGroup) {
      return res.status(404).json({ message: 'Question group not found' });
    }
    
    // Check if this group is mapped to any products
    const productMappings = await db.select()
      .from(productQuestionMappings)
      .where(eq(productQuestionMappings.groupId, groupId));
    
    if (productMappings.length > 0) {
      return res.status(400).json({ 
        message: 'This question group is mapped to products and cannot be deleted' 
      });
    }
    
    // Delete all questions in this group first
    await db.delete(questions)
      .where(eq(questions.groupId, groupId));
    
    // Delete the group
    const [deletedGroup] = await db.delete(questionGroups)
      .where(eq(questionGroups.id, groupId))
      .returning();
    
    res.json(deletedGroup);
  } catch (error: any) {
    console.error(`Error deleting question group ${req.params.id}:`, error);
    res.status(500).json({ message: error.message || 'Failed to delete question group' });
  }
});

export default router;