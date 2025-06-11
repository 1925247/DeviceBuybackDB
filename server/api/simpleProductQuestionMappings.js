import { Router } from 'express';
import { db } from '../db.js';
import { productQuestionMappings, deviceModels, questions } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all product question mappings
router.get('/', async (_req, res) => {
  try {
    const result = await db
      .select({
        id: productQuestionMappings.id,
        productId: productQuestionMappings.productId,
        questionId: productQuestionMappings.questionId,
        active: productQuestionMappings.active,
        productName: deviceModels.name,
        questionText: questions.questionText,
        createdAt: productQuestionMappings.createdAt,
        updatedAt: productQuestionMappings.updatedAt
      })
      .from(productQuestionMappings)
      .leftJoin(deviceModels, eq(productQuestionMappings.productId, deviceModels.id))
      .leftJoin(questions, eq(productQuestionMappings.questionId, questions.id));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching product question mappings:', error);
    res.status(500).json({ message: 'Failed to fetch product question mappings' });
  }
});

// Get mapping by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mapping = await db
      .select()
      .from(productQuestionMappings)
      .where(eq(productQuestionMappings.id, parseInt(id)))
      .limit(1);
    
    if (!mapping.length) {
      return res.status(404).json({ message: 'Mapping not found' });
    }
    
    res.json(mapping[0]);
  } catch (error) {
    console.error('Error fetching mapping:', error);
    res.status(500).json({ message: 'Failed to fetch mapping' });
  }
});

// Create new mapping
router.post('/', async (req, res) => {
  try {
    const result = await db.insert(productQuestionMappings).values(req.body).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating mapping:', error);
    res.status(500).json({ message: 'Failed to create mapping' });
  }
});

// Update mapping
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db
      .update(productQuestionMappings)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(productQuestionMappings.id, parseInt(id)))
      .returning();
    
    if (!result.length) {
      return res.status(404).json({ message: 'Mapping not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating mapping:', error);
    res.status(500).json({ message: 'Failed to update mapping' });
  }
});

// Delete mapping
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.delete(productQuestionMappings).where(eq(productQuestionMappings.id, parseInt(id))).returning();
    
    if (!result.length) {
      return res.status(404).json({ message: 'Mapping not found' });
    }
    
    res.json({ message: 'Mapping deleted successfully' });
  } catch (error) {
    console.error('Error deleting mapping:', error);
    res.status(500).json({ message: 'Failed to delete mapping' });
  }
});

export default router;