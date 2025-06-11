import { Router } from 'express';
import { db } from '../db.js';
import { featureToggles } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all feature toggles
router.get('/', async (_req, res) => {
  try {
    const result = await db.select().from(featureToggles);
    res.json(result);
  } catch (error) {
    console.error('Error fetching feature toggles:', error);
    res.status(500).json({ message: 'Failed to fetch feature toggles' });
  }
});

// Get feature toggle by key
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const toggle = await db.select().from(featureToggles).where(eq(featureToggles.featureKey, key)).limit(1);
    
    if (!toggle.length) {
      return res.status(404).json({ message: 'Feature toggle not found' });
    }
    
    res.json(toggle[0]);
  } catch (error) {
    console.error('Error fetching feature toggle:', error);
    res.status(500).json({ message: 'Failed to fetch feature toggle' });
  }
});

// Create new feature toggle
router.post('/', async (req, res) => {
  try {
    const result = await db.insert(featureToggles).values(req.body).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating feature toggle:', error);
    res.status(500).json({ message: 'Failed to create feature toggle' });
  }
});

// Update feature toggle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db
      .update(featureToggles)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(featureToggles.id, parseInt(id)))
      .returning();
    
    if (!result.length) {
      return res.status(404).json({ message: 'Feature toggle not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating feature toggle:', error);
    res.status(500).json({ message: 'Failed to update feature toggle' });
  }
});

// Toggle feature on/off
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get current state
    const current = await db.select().from(featureToggles).where(eq(featureToggles.id, parseInt(id))).limit(1);
    
    if (!current.length) {
      return res.status(404).json({ message: 'Feature toggle not found' });
    }
    
    // Toggle the state
    const result = await db
      .update(featureToggles)
      .set({ 
        isEnabled: !current[0].isEnabled,
        lastModifiedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(featureToggles.id, parseInt(id)))
      .returning();
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error toggling feature:', error);
    res.status(500).json({ message: 'Failed to toggle feature' });
  }
});

export const featureToggleRouter = router;
export default router;