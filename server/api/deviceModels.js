import { Router } from 'express';
import { db } from '../db.js';
import { deviceModels, brands, deviceTypes } from '../../shared/schema.js';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { uploadSingleImage } from '../middleware/upload.js';

const router = Router();

// Get all device models with brand and device type info, with optional filtering
router.get('/', async (req, res) => {
  try {
    const { deviceType, brand, includeDetails = false } = req.query;
    
    if (deviceType && brand) {
      // Filter by both device type and brand using raw SQL for complex joins
      const result = await db.execute(`
        SELECT 
          dm.id, dm.name, dm.slug, dm.image, dm.active, dm.featured,
          dm.brand_id as "brandId", b.name as "brandName",
          dm.device_type_id as "deviceTypeId", dt.name as "deviceTypeName",
          dm.created_at as "createdAt", dm.updated_at as "updatedAt"
        FROM device_models dm
        JOIN brands b ON dm.brand_id = b.id
        JOIN device_types dt ON dm.device_type_id = dt.id
        WHERE dt.slug = $1 AND b.slug = $2 AND dm.active = true
        ORDER BY dm.name
      `, [deviceType, brand]);
      res.json(result.rows);
    } else if (deviceType) {
      // Filter by device type only
      const result = await db.execute(`
        SELECT 
          dm.id, dm.name, dm.slug, dm.image, dm.active, dm.featured,
          dm.brand_id as "brandId", b.name as "brandName",
          dm.device_type_id as "deviceTypeId", dt.name as "deviceTypeName",
          dm.created_at as "createdAt", dm.updated_at as "updatedAt"
        FROM device_models dm
        JOIN brands b ON dm.brand_id = b.id
        JOIN device_types dt ON dm.device_type_id = dt.id
        WHERE dt.slug = $1 AND dm.active = true
        ORDER BY dm.name
      `, [deviceType]);
      res.json(result.rows);
    } else {
      // Get all models with full details for admin interface
      if (includeDetails === 'true') {
        const result = await db.execute(sql`
          SELECT 
            dm.id, dm.name, dm.slug, dm.image, dm.active, dm.featured,
            dm.brand_id as "brandId", b.name as "brandName",
            dm.device_type_id as "deviceTypeId", dt.name as "deviceTypeName",
            dm.year, dm.base_price as "basePrice", dm.description, 
            dm.specifications, dm.priority,
            dm.created_at as "createdAt", dm.updated_at as "updatedAt"
          FROM device_models dm
          LEFT JOIN brands b ON dm.brand_id = b.id
          LEFT JOIN device_types dt ON dm.device_type_id = dt.id
          ORDER BY dm.priority DESC, dm.name
        `);
        res.json(result.rows || result);
      } else {
        // Get basic model info for public API
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
          .leftJoin(deviceTypes, eq(deviceModels.device_type_id, deviceTypes.id))
          .where(eq(deviceModels.active, true));
        
        res.json(result);
      }
    }
  } catch (error) {
    console.error('Error fetching device models:', error);
    res.status(500).json({ message: 'Failed to fetch device models' });
  }
});

// Upload model image
router.post('/upload-image', uploadSingleImage, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

// Get device model by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.execute(sql`
      SELECT 
        dm.*, 
        b.name as "brandName", 
        dt.name as "deviceTypeName"
      FROM device_models dm
      LEFT JOIN brands b ON dm.brand_id = b.id
      LEFT JOIN device_types dt ON dm.device_type_id = dt.id
      WHERE dm.id = ${parseInt(id)}
    `);
    
    const rows = result.rows || result;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Model not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching device model:', error);
    res.status(500).json({ message: 'Failed to fetch device model' });
  }
});

// Create new device model
router.post('/', async (req, res) => {
  try {
    const modelData = {
      name: req.body.name,
      slug: req.body.slug,
      brand_id: req.body.brandId,
      device_type_id: req.body.deviceTypeId,
      year: req.body.year || new Date().getFullYear(),
      base_price: req.body.basePrice || 0,
      image: req.body.image || null,
      description: req.body.description || null,
      specifications: req.body.specifications || null,
      featured: req.body.featured || false,
      active: req.body.active !== false,
      priority: req.body.priority || 0
    };

    const result = await db.insert(deviceModels).values(modelData).returning();
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
    const updateData = {
      name: req.body.name,
      slug: req.body.slug,
      brand_id: req.body.brandId,
      device_type_id: req.body.deviceTypeId,
      year: req.body.year,
      base_price: req.body.basePrice || 0,
      image: req.body.image || null,
      description: req.body.description || null,
      specifications: req.body.specifications || null,
      featured: req.body.featured || false,
      active: req.body.active !== false,
      priority: req.body.priority || 0,
      updated_at: new Date()
    };

    const result = await db
      .update(deviceModels)
      .set(updateData)
      .where(eq(deviceModels.id, parseInt(id)))
      .returning();

    if (!result.length) {
      return res.status(404).json({ message: 'Model not found' });
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
    
    const result = await db
      .delete(deviceModels)
      .where(eq(deviceModels.id, parseInt(id)))
      .returning();

    if (!result.length) {
      return res.status(404).json({ message: 'Model not found' });
    }

    res.json({ message: 'Model deleted successfully' });
  } catch (error) {
    console.error('Error deleting device model:', error);
    res.status(500).json({ message: 'Failed to delete device model' });
  }
});

// Bulk delete device models
router.post('/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Invalid model IDs' });
    }

    const result = await db
      .delete(deviceModels)
      .where(inArray(deviceModels.id, ids.map(id => parseInt(id))))
      .returning();

    res.json({ message: `${result.length} models deleted successfully` });
  } catch (error) {
    console.error('Error bulk deleting models:', error);
    res.status(500).json({ message: 'Failed to delete models' });
  }
});

export default router;