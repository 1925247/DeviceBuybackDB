import { Router } from 'express';
import { db } from '../db.js';
import { deviceTypes } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all device types
router.get('/', async (_req, res) => {
  try {
    const result = await db.select().from(deviceTypes);
    res.json(result);
  } catch (error) {
    console.error('Error fetching device types:', error);
    res.status(500).json({ message: 'Failed to fetch device types' });
  }
});

// Get device type by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deviceType = await db.select().from(deviceTypes).where(eq(deviceTypes.id, parseInt(id))).limit(1);
    
    if (!deviceType.length) {
      return res.status(404).json({ message: 'Device type not found' });
    }
    
    res.json(deviceType[0]);
  } catch (error) {
    console.error('Error fetching device type:', error);
    res.status(500).json({ message: 'Failed to fetch device type' });
  }
});

// Create new device type
router.post('/', async (req, res) => {
  try {
    const result = await db.insert(deviceTypes).values(req.body).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating device type:', error);
    res.status(500).json({ message: 'Failed to create device type' });
  }
});

// Update device type
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db
      .update(deviceTypes)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(deviceTypes.id, parseInt(id)))
      .returning();
    
    if (!result.length) {
      return res.status(404).json({ message: 'Device type not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating device type:', error);
    res.status(500).json({ message: 'Failed to update device type' });
  }
});

// Delete device type
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.delete(deviceTypes).where(eq(deviceTypes.id, parseInt(id))).returning();
    
    if (!result.length) {
      return res.status(404).json({ message: 'Device type not found' });
    }
    
    res.json({ message: 'Device type deleted successfully' });
  } catch (error) {
    console.error('Error deleting device type:', error);
    res.status(500).json({ message: 'Failed to delete device type' });
  }
});

export default router;