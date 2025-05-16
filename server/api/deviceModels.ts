import express, { Request, Response } from 'express';
import { db } from '../db';
import { deviceModels, brands } from '../../shared/schema';
import { eq, asc } from 'drizzle-orm';

const router = express.Router();

// Get all device models with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const brandId = req.query.brand_id ? parseInt(req.query.brand_id as string) : undefined;
    const deviceTypeId = req.query.device_type_id ? parseInt(req.query.device_type_id as string) : undefined;
    
    // Build the base query
    let query = db.select().from(deviceModels);
    
    // Apply filters if provided
    if (brandId) {
      query = query.where(eq(deviceModels.brand_id, brandId));
    }
    
    if (deviceTypeId) {
      query = query.where(eq(deviceModels.device_type_id, deviceTypeId));
    }
    
    // Execute the query with ordering
    const results = await query.orderBy(asc(deviceModels.name));
    res.json(results);
  } catch (error: any) {
    console.error("Error fetching device models:", error);
    res.status(500).json({ message: error.message || "Failed to fetch device models" });
  }
});

// Get a specific device model by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid device model ID" });
    }
    
    const [model] = await db.select().from(deviceModels).where(eq(deviceModels.id, id));
    
    if (!model) {
      return res.status(404).json({ message: "Device model not found" });
    }
    
    res.json(model);
  } catch (error: any) {
    console.error(`Error fetching device model with ID ${req.params.id}:`, error);
    res.status(500).json({ message: error.message || "Failed to fetch device model" });
  }
});

export default router;