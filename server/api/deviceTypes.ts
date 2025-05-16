import { Request, Response, Router } from 'express';
import { db } from '../db';
import { deviceTypes } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all device types
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await db.select().from(deviceTypes);
    res.json(result);
  } catch (error) {
    console.error('Error fetching device types:', error);
    res.status(500).json({ message: 'Failed to fetch device types' });
  }
});

// Get device type by id
router.get('/:id', async (req: Request, res: Response) => {
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

export default router;