import { Router } from 'express';
import { db } from '../db.js';
import { questionGroups } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all question groups
router.get('/', async (_req, res) => {
  try {
    const result = await db.select().from(questionGroups);
    res.json(result);
  } catch (error) {
    console.error('Error fetching question groups:', error);
    res.status(500).json({ message: 'Failed to fetch question groups' });
  }
});

// Get question group by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const questionGroup = await db.select().from(questionGroups).where(eq(questionGroups.id, parseInt(id))).limit(1);
    
    if (!questionGroup.length) {
      return res.status(404).json({ message: 'Question group not found' });
    }
    
    res.json(questionGroup[0]);
  } catch (error) {
    console.error('Error fetching question group:', error);
    res.status(500).json({ message: 'Failed to fetch question group' });
  }
});

// Create new question group
router.post('/', async (req, res) => {
  try {
    const result = await db.insert(questionGroups).values(req.body).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating question group:', error);
    res.status(500).json({ message: 'Failed to create question group' });
  }
});

// Update question group
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db
      .update(questionGroups)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(questionGroups.id, parseInt(id)))
      .returning();
    
    if (!result.length) {
      return res.status(404).json({ message: 'Question group not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating question group:', error);
    res.status(500).json({ message: 'Failed to update question group' });
  }
});

// Delete question group
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.delete(questionGroups).where(eq(questionGroups.id, parseInt(id))).returning();
    
    if (!result.length) {
      return res.status(404).json({ message: 'Question group not found' });
    }
    
    res.json({ message: 'Question group deleted successfully' });
  } catch (error) {
    console.error('Error deleting question group:', error);
    res.status(500).json({ message: 'Failed to delete question group' });
  }
});

export default router;