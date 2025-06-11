import { Router } from 'express';
import { db } from '../db.js';
import { deviceModels, brands, deviceTypes } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all device models with brand and device type info
router.get('/', async (_req, res) => {
  try {
    const result = await db
      .select({
        id: deviceModels.id,
        name: deviceModels.name,
        slug: deviceModels.slug,
        image: deviceModels.image,
        active: deviceModels.active,
        featured: deviceModels.featured,
        brandId: deviceModels.brand_id,
        brandName: brands.name,
        deviceTypeId: deviceModels.device_type_id,
        deviceTypeName: deviceTypes.name,
        createdAt: deviceModels.createdAt,
        updatedAt: deviceModels.updatedAt
      })
      .from(deviceModels)
      .leftJoin(brands, eq(deviceModels.brand_id, brands.id))
      .leftJoin(deviceTypes, eq(deviceModels.device_type_id, deviceTypes.id));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching device models:', error);
    res.status(500).json({ message: 'Failed to fetch device models' });
  }
});

// Get device model by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deviceModel = await db
      .select({
        id: deviceModels.id,
        name: deviceModels.name,
        slug: deviceModels.slug,
        image: deviceModels.image,
        active: deviceModels.active,
        featured: deviceModels.featured,
        variants: deviceModels.variants,
        brandId: deviceModels.brand_id,
        brandName: brands.name,
        deviceTypeId: deviceModels.device_type_id,
        deviceTypeName: deviceTypes.name,
        createdAt: deviceModels.createdAt,
        updatedAt: deviceModels.updatedAt
      })
      .from(deviceModels)
      .leftJoin(brands, eq(deviceModels.brand_id, brands.id))
      .leftJoin(deviceTypes, eq(deviceModels.device_type_id, deviceTypes.id))
      .where(eq(deviceModels.id, parseInt(id)))
      .limit(1);
    
    if (!deviceModel.length) {
      return res.status(404).json({ message: 'Device model not found' });
    }
    
    res.json(deviceModel[0]);
  } catch (error) {
    console.error('Error fetching device model:', error);
    res.status(500).json({ message: 'Failed to fetch device model' });
  }
});

// Create new device model
router.post('/', async (req, res) => {
  try {
    const result = await db.insert(deviceModels).values(req.body).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating device model:', error);
    res.status(500).json({ message: 'Failed to create device model' });
  }
});

// Update device model
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db
      .update(deviceModels)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(deviceModels.id, parseInt(id)))
      .returning();
    
    if (!result.length) {
      return res.status(404).json({ message: 'Device model not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating device model:', error);
    res.status(500).json({ message: 'Failed to update device model' });
  }
});

// Delete device model
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.delete(deviceModels).where(eq(deviceModels.id, parseInt(id))).returning();
    
    if (!result.length) {
      return res.status(404).json({ message: 'Device model not found' });
    }
    
    res.json({ message: 'Device model deleted successfully' });
  } catch (error) {
    console.error('Error deleting device model:', error);
    res.status(500).json({ message: 'Failed to delete device model' });
  }
});

export default router;