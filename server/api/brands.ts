import express, { Request, Response } from 'express';
import { db } from '../db';
import { brands, deviceModels, brandDeviceTypes } from '../../shared/schema';
import { eq, asc } from 'drizzle-orm';

const router = express.Router();

// Get all brands with optional device type filter
router.get('/', async (req: Request, res: Response) => {
  try {
    const deviceTypeId = req.query.device_type_id ? parseInt(req.query.device_type_id as string) : undefined;
    
    if (deviceTypeId) {
      // Get brands that have models for this device type
      const distinctBrands = await db.select({
        id: brands.id,
        name: brands.name,
        logo: brands.logo,
        slug: brands.slug
      })
      .from(brands)
      .innerJoin(deviceModels, eq(brands.id, deviceModels.brand_id))
      .where(eq(deviceModels.device_type_id, deviceTypeId))
      .groupBy(brands.id)
      .orderBy(asc(brands.name));
      
      res.json(distinctBrands);
    } else {
      // Return all brands
      const allBrands = await db.select().from(brands).orderBy(asc(brands.name));
      res.json(allBrands);
    }
  } catch (error: any) {
    console.error("Error fetching brands:", error);
    res.status(500).json({ message: error.message || "Failed to fetch brands" });
  }
});

// Get a specific brand by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid brand ID" });
    }
    
    const [brand] = await db.select().from(brands).where(eq(brands.id, id));
    
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    
    res.json(brand);
  } catch (error: any) {
    console.error(`Error fetching brand with ID ${req.params.id}:`, error);
    res.status(500).json({ message: error.message || "Failed to fetch brand" });
  }
});

export default router;