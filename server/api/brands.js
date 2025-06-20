import { Router } from 'express';
import { db } from '../db.js';
import { brands, brandDeviceTypes, deviceTypes } from '../../shared/schema.js';
import { eq, sql, inArray } from 'drizzle-orm';
import { uploadSingleImage } from '../middleware/upload.js';

const router = Router();

// Get all brands with device type mappings
router.get('/', async (req, res) => {
  try {
    const { deviceType, includeDeviceTypes = false, slug, hasModels = false } = req.query;
    
    if (slug) {
      // Get specific brand by slug
      const result = await db.select().from(brands).where(eq(brands.slug, slug));
      res.json(Array.isArray(result) ? result : []);
    } else if (deviceType) {
      // Get brands that have models for the specific device type
      if (hasModels === 'true') {
        const result = await db.execute(sql`
          SELECT DISTINCT b.*, 
                 COUNT(dm.id) as model_count
          FROM brands b
          LEFT JOIN device_models dm ON b.id = dm.brand_id
          LEFT JOIN device_types dt ON dm.device_type_id = dt.id
          WHERE dt.slug = ${deviceType} AND b.active = true AND dm.active = true
          GROUP BY b.id
          HAVING COUNT(dm.id) > 0
          ORDER BY b.priority DESC, b.name
        `);
        res.json(Array.isArray(result.rows) ? result.rows : Array.isArray(result) ? result : []);
      } else {
        // Get brands that support the specific device type (legacy behavior)
        const result = await db.execute(sql`
          SELECT DISTINCT b.*, 
                 COALESCE(array_agg(DISTINCT dt.name) FILTER (WHERE dt.name IS NOT NULL), '{}') as device_types
          FROM brands b
          JOIN brand_device_types bdt ON b.id = bdt.brand_id
          JOIN device_types dt ON bdt.device_type_id = dt.id
          WHERE dt.slug = ${deviceType} AND b.active = true
          GROUP BY b.id
          ORDER BY b.priority DESC, b.name
        `);
        res.json(Array.isArray(result.rows) ? result.rows : Array.isArray(result) ? result : []);
      }
    } else {
      // Get all brands with optional device types
      let query = db.select({
        id: brands.id,
        name: brands.name,
        slug: brands.slug,
        logo: brands.logo,
        logoType: brands.logoType,
        description: brands.description,
        website: brands.website,
        active: brands.active,
        featured: brands.featured,
        priority: brands.priority,
        createdAt: brands.createdAt,
        updatedAt: brands.updatedAt,
      }).from(brands);

      if (includeDeviceTypes === 'true') {
        const result = await db.execute(sql`
          SELECT b.*, 
                 COALESCE(
                   json_agg(
                     json_build_object(
                       'id', dt.id,
                       'name', dt.name,
                       'slug', dt.slug
                     )
                   ) FILTER (WHERE dt.id IS NOT NULL), 
                   '[]'
                 ) as device_types
          FROM brands b
          LEFT JOIN brand_device_types bdt ON b.id = bdt.brand_id
          LEFT JOIN device_types dt ON bdt.device_type_id = dt.id
          GROUP BY b.id
          ORDER BY b.priority DESC, b.name
        `);
        res.json(Array.isArray(result.rows) ? result.rows : Array.isArray(result) ? result : []);
      } else {
        const result = await query.orderBy(sql`${brands.priority} DESC, ${brands.name}`);
        res.json(Array.isArray(result) ? result : []);
      }
    }
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(200).json([]);
  }
});

// Get brand by id with device types
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const brandId = parseInt(id);
    
    // Use Drizzle ORM for consistency
    const brandQuery = await db.select().from(brands).where(eq(brands.id, brandId));
    
    if (brandQuery.length === 0) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    
    const brand = brandQuery[0];
    
    // Get device type mappings using raw SQL since it works
    const deviceTypesResult = await db.execute(sql`
      SELECT dt.id, dt.name, dt.slug
      FROM device_types dt
      JOIN brand_device_types bdt ON dt.id = bdt.device_type_id
      WHERE bdt.brand_id = ${brandId}
    `);
    
    const device_types = deviceTypesResult.rows || deviceTypesResult || [];
    const device_type_ids = device_types.map(dt => dt.id);
    
    res.json({
      ...brand,
      device_types,
      device_type_ids
    });
  } catch (error) {
    console.error('Error fetching brand:', error);
    res.status(500).json({ message: 'Failed to fetch brand' });
  }
});

// Upload brand logo
router.post('/upload-logo', uploadSingleImage, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const logoUrl = `/uploads/${req.file.filename}`;
    res.json({ logoUrl });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ message: 'Failed to upload logo' });
  }
});

// Create new brand with device type mappings
router.post('/', async (req, res) => {
  try {
    const { deviceTypeIds, ...brandData } = req.body;
    
    // Insert brand
    const brandResult = await db.insert(brands).values(brandData).returning();
    const brand = brandResult[0];
    
    // Insert device type mappings if provided
    if (deviceTypeIds && deviceTypeIds.length > 0) {
      const mappings = deviceTypeIds.map(deviceTypeId => ({
        brand_id: brand.id,
        device_type_id: parseInt(deviceTypeId)
      }));
      
      await db.insert(brandDeviceTypes).values(mappings);
    }
    
    res.status(201).json(brand);
  } catch (error) {
    console.error('Error creating brand:', error);
    res.status(500).json({ message: 'Failed to create brand' });
  }
});

// Update brand with device type mappings
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { deviceTypeIds, ...brandData } = req.body;
    
    // Update brand
    const brandResult = await db
      .update(brands)
      .set({ ...brandData, updatedAt: new Date() })
      .where(eq(brands.id, parseInt(id)))
      .returning();
    
    if (!brandResult.length) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    
    // Update device type mappings if provided
    if (deviceTypeIds !== undefined) {
      // Delete existing mappings
      await db.delete(brandDeviceTypes).where(eq(brandDeviceTypes.brand_id, parseInt(id)));
      
      // Insert new mappings
      if (deviceTypeIds.length > 0) {
        const mappings = deviceTypeIds.map(deviceTypeId => ({
          brand_id: parseInt(id),
          device_type_id: parseInt(deviceTypeId)
        }));
        
        await db.insert(brandDeviceTypes).values(mappings);
      }
    }
    
    res.json(brandResult[0]);
  } catch (error) {
    console.error('Error updating brand:', error);
    res.status(500).json({ message: 'Failed to update brand' });
  }
});

// Bulk update brand priorities
router.post('/bulk-update-priority', async (req, res) => {
  try {
    const { updates } = req.body; // Array of { id, priority }
    
    const promises = updates.map(({ id, priority }) =>
      db.update(brands)
        .set({ priority: parseInt(priority), updatedAt: new Date() })
        .where(eq(brands.id, parseInt(id)))
    );
    
    await Promise.all(promises);
    res.json({ message: 'Brand priorities updated successfully' });
  } catch (error) {
    console.error('Error updating brand priorities:', error);
    res.status(500).json({ message: 'Failed to update priorities' });
  }
});

// Bulk delete brands
router.post('/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Invalid brand IDs' });
    }
    
    // Delete device type mappings first
    await db.delete(brandDeviceTypes).where(inArray(brandDeviceTypes.brand_id, ids.map(id => parseInt(id))));
    
    // Delete brands
    const result = await db.delete(brands).where(inArray(brands.id, ids.map(id => parseInt(id)))).returning();
    
    res.json({ message: `${result.length} brands deleted successfully` });
  } catch (error) {
    console.error('Error bulk deleting brands:', error);
    res.status(500).json({ message: 'Failed to delete brands' });
  }
});

// Delete brand
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete device type mappings first
    await db.delete(brandDeviceTypes).where(eq(brandDeviceTypes.brand_id, parseInt(id)));
    
    // Delete brand
    const result = await db.delete(brands).where(eq(brands.id, parseInt(id))).returning();
    
    if (!result.length) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    
    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Error deleting brand:', error);
    res.status(500).json({ message: 'Failed to delete brand' });
  }
});

export default router;