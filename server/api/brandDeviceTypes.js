import { Router } from 'express';
import { db } from '../db.js';
import { brandDeviceTypes, brands, deviceTypes } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all brand device type mappings
router.get('/', async (_req, res) => {
  try {
    const result = await db
      .select({
        id: brandDeviceTypes.id,
        brandId: brandDeviceTypes.brand_id,
        deviceTypeId: brandDeviceTypes.device_type_id,
        brandName: brands.name,
        brandSlug: brands.slug,
        deviceTypeName: deviceTypes.name,
        deviceTypeSlug: deviceTypes.slug,
        createdAt: brandDeviceTypes.createdAt,
        updatedAt: brandDeviceTypes.updatedAt
      })
      .from(brandDeviceTypes)
      .leftJoin(brands, eq(brandDeviceTypes.brand_id, brands.id))
      .leftJoin(deviceTypes, eq(brandDeviceTypes.device_type_id, deviceTypes.id));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching brand device types:', error);
    res.status(500).json({ message: 'Failed to fetch brand device types' });
  }
});

// Get mapping by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mapping = await db.select().from(brandDeviceTypes).where(eq(brandDeviceTypes.id, parseInt(id))).limit(1);
    
    if (!mapping.length) {
      return res.status(404).json({ message: 'Brand device type mapping not found' });
    }
    
    res.json(mapping[0]);
  } catch (error) {
    console.error('Error fetching brand device type mapping:', error);
    res.status(500).json({ message: 'Failed to fetch mapping' });
  }
});

// Create new mapping
router.post('/', async (req, res) => {
  try {
    const result = await db.insert(brandDeviceTypes).values(req.body).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating brand device type mapping:', error);
    res.status(500).json({ message: 'Failed to create mapping' });
  }
});

// Update mapping
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db
      .update(brandDeviceTypes)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(brandDeviceTypes.id, parseInt(id)))
      .returning();
    
    if (!result.length) {
      return res.status(404).json({ message: 'Brand device type mapping not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating brand device type mapping:', error);
    res.status(500).json({ message: 'Failed to update mapping' });
  }
});

// Delete mapping
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.delete(brandDeviceTypes).where(eq(brandDeviceTypes.id, parseInt(id))).returning();
    
    if (!result.length) {
      return res.status(404).json({ message: 'Brand device type mapping not found' });
    }
    
    res.json({ message: 'Brand device type mapping deleted successfully' });
  } catch (error) {
    console.error('Error deleting brand device type mapping:', error);
    res.status(500).json({ message: 'Failed to delete mapping' });
  }
});

export default router;