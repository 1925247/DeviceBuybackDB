import { Router } from 'express';
import { db, pool } from '../db.js';
import { deviceModels, brands, deviceTypes } from '../../shared/schema.js';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { uploadSingleImage } from '../middleware/upload.js';

const router = Router();

// Get all device models with brand and device type info, with optional filtering
router.get('/', async (req, res) => {
  try {
    const { deviceType, brand, includeDetails = false, search } = req.query;
    console.log('Device models API called with:', { deviceType, brand, includeDetails, search });
    
    if (search) {
      // Search functionality - find models by name, brand name, or specifications
      const searchTerm = `%${search.toLowerCase()}%`;
      const queryText = `
        SELECT 
          dm.id, dm.name, dm.slug, dm.image, dm.active, dm.featured,
          dm.year, COALESCE(dm.base_price, 0) as "basePrice", dm.description, 
          dm.specifications, COALESCE(dm.priority, 0) as priority,
          dm.brand_id as "brandId", b.name as "brandName",
          dm.device_type_id as "deviceTypeId", dt.name as "deviceTypeName",
          dm.created_at as "createdAt", dm.updated_at as "updatedAt",
          COALESCE(
            json_agg(
              CASE WHEN dmv.id IS NOT NULL THEN
                json_build_object(
                  'id', dmv.id,
                  'name', dmv.name,
                  'storage', dmv.storage,
                  'price', dmv.price,
                  'priority', dmv.priority
                )
              END
            ) FILTER (WHERE dmv.id IS NOT NULL), 
            '[]'
          ) as variants
        FROM device_models dm
        LEFT JOIN brands b ON dm.brand_id = b.id
        LEFT JOIN device_types dt ON dm.device_type_id = dt.id
        LEFT JOIN device_model_variants dmv ON dm.id = dmv.model_id AND dmv.active = true
        WHERE dm.active = true AND (
          LOWER(dm.name) LIKE $1 OR 
          LOWER(b.name) LIKE $1 OR
          LOWER(dt.name) LIKE $1 OR
          LOWER(dm.description) LIKE $1
        )
        GROUP BY dm.id, b.id, dt.id
        ORDER BY 
          CASE WHEN LOWER(dm.name) LIKE $1 THEN 1 ELSE 2 END,
          COALESCE(dm.priority, 0) DESC, 
          dm.name
        LIMIT 10
      `;
      
      const result = await pool.query(queryText, [searchTerm]);
      res.json(Array.isArray(result.rows) ? result.rows : []);
      
    } else if (deviceType && brand) {
      // Filter by both device type and brand
      const queryText = `
        SELECT 
          dm.id, dm.name, dm.slug, dm.image, dm.active, dm.featured,
          dm.year, COALESCE(dm.base_price, 0) as "basePrice", dm.description, 
          dm.specifications, COALESCE(dm.priority, 0) as priority,
          dm.brand_id as "brandId", b.name as "brandName",
          dm.device_type_id as "deviceTypeId", dt.name as "deviceTypeName",
          dm.created_at as "createdAt", dm.updated_at as "updatedAt",
          COALESCE(
            json_agg(
              CASE WHEN dmv.id IS NOT NULL THEN
                json_build_object(
                  'id', dmv.id,
                  'name', dmv.variant_name,
                  'storage', dmv.storage,
                  'price', dmv.current_price,
                  'basePrice', dmv.base_price
                )
              END
              ORDER BY dmv.base_price ASC
            ) FILTER (WHERE dmv.id IS NOT NULL), 
            '[]'
          ) as variants
        FROM device_models dm
        LEFT JOIN brands b ON dm.brand_id = b.id
        LEFT JOIN device_types dt ON dm.device_type_id = dt.id
        LEFT JOIN device_model_variants dmv ON dm.id = dmv.model_id AND dmv.active = true
        WHERE dt.slug = $1 AND b.slug = $2 AND dm.active = true
        GROUP BY dm.id, b.id, dt.id
        ORDER BY COALESCE(dm.priority, 0) DESC, dm.name
      `;
      
      const result = await pool.query(queryText, [deviceType, brand]);
      res.json(Array.isArray(result.rows) ? result.rows : []);
      
    } else if (deviceType) {
      // Filter by device type only
      const queryText = `
        SELECT 
          dm.id, dm.name, dm.slug, dm.image, dm.active, dm.featured,
          dm.year, dm.base_price as "basePrice", dm.description,
          dm.brand_id as "brandId", b.name as "brandName",
          dm.device_type_id as "deviceTypeId", dt.name as "deviceTypeName",
          dm.created_at as "createdAt", dm.updated_at as "updatedAt"
        FROM device_models dm
        LEFT JOIN brands b ON dm.brand_id = b.id
        LEFT JOIN device_types dt ON dm.device_type_id = dt.id
        WHERE dt.slug = $1 AND dm.active = true
        ORDER BY dm.name
      `;
      
      const result = await pool.query(queryText, [deviceType]);
      res.json(Array.isArray(result.rows) ? result.rows : []);
      
    } else {
      // Get all models with full details for admin interface
      if (includeDetails === 'true') {
        const queryText = `
          SELECT 
            dm.id, dm.name, dm.slug, dm.image, dm.active, dm.featured,
            dm.year, dm.base_price as "basePrice", dm.description, 
            dm.specifications, dm.priority,
            dm.brand_id as "brandId", b.name as "brandName",
            dm.device_type_id as "deviceTypeId", dt.name as "deviceTypeName",
            dm.created_at as "createdAt", dm.updated_at as "updatedAt"
          FROM device_models dm
          LEFT JOIN brands b ON dm.brand_id = b.id
          LEFT JOIN device_types dt ON dm.device_type_id = dt.id
          ORDER BY dm.priority DESC, dm.name
        `;
        
        const result = await pool.query(queryText);
        res.json(Array.isArray(result.rows) ? result.rows : []);
        
      } else {
        // Get basic model info for public API
        const queryText = `
          SELECT 
            dm.id, dm.name, dm.slug, dm.image, dm.active, dm.featured,
            dm.brand_id as "brandId", b.name as "brandName",
            dm.device_type_id as "deviceTypeId", dt.name as "deviceTypeName"
          FROM device_models dm
          LEFT JOIN brands b ON dm.brand_id = b.id
          LEFT JOIN device_types dt ON dm.device_type_id = dt.id
          WHERE dm.active = true
          ORDER BY dm.name
        `;
        
        const result = await pool.query(queryText);
        res.json(Array.isArray(result.rows) ? result.rows : []);
      }
    }
  } catch (error) {
    console.error('Error fetching device models:', error);
    console.error('Error details:', error.message);
    res.status(200).json([]);
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
    const queryText = `
      SELECT 
        dm.*, 
        b.name as "brandName",
        dt.name as "deviceTypeName"
      FROM device_models dm
      LEFT JOIN brands b ON dm.brand_id = b.id
      LEFT JOIN device_types dt ON dm.device_type_id = dt.id
      WHERE dm.id = $1
    `;
    
    const result = await pool.query(queryText, [parseInt(id)]);
    
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ message: 'Model not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching device model:', error);
    res.status(500).json({ message: 'Failed to fetch device model' });
  }
});

// Create new device model
router.post('/', async (req, res) => {
  try {
    console.log('Creating model with data:', req.body);
    
    const insertQuery = `
      INSERT INTO device_models (
        name, slug, brand_id, device_type_id, year, base_price, 
        image, description, specifications, featured, active, priority
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    
    const values = [
      req.body.name,
      req.body.slug,
      parseInt(req.body.brand_id) || parseInt(req.body.brandId),
      parseInt(req.body.device_type_id) || parseInt(req.body.deviceTypeId),
      parseInt(req.body.year) || new Date().getFullYear(),
      parseFloat(req.body.base_price) || parseFloat(req.body.basePrice) || 0,
      req.body.image || null,
      req.body.description || null,
      req.body.specifications || null,
      req.body.featured || false,
      req.body.active !== false,
      parseInt(req.body.priority) || 0
    ];
    
    const result = await pool.query(insertQuery, values);
    res.status(201).json(result.rows[0]);
    
  } catch (error) {
    console.error('Error creating device model:', error);
    res.status(500).json({ message: 'Failed to create device model', error: error.message });
  }
});

// Update device model
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating model with data:', req.body);
    
    const updateQuery = `
      UPDATE device_models SET
        name = $1,
        slug = $2,
        brand_id = $3,
        device_type_id = $4,
        year = $5,
        base_price = $6,
        image = $7,
        description = $8,
        specifications = $9,
        featured = $10,
        active = $11,
        priority = $12,
        updated_at = NOW()
      WHERE id = $13
      RETURNING *
    `;
    
    const values = [
      req.body.name,
      req.body.slug,
      parseInt(req.body.brand_id) || parseInt(req.body.brandId),
      parseInt(req.body.device_type_id) || parseInt(req.body.deviceTypeId),
      parseInt(req.body.year),
      parseFloat(req.body.base_price) || parseFloat(req.body.basePrice) || 0,
      req.body.image || null,
      req.body.description || null,
      req.body.specifications || null,
      req.body.featured || false,
      req.body.active !== false,
      parseInt(req.body.priority) || 0,
      parseInt(id)
    ];
    
    const result = await pool.query(updateQuery, values);
    
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ message: 'Model not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating device model:', error);
    res.status(500).json({ message: 'Failed to update device model', error: error.message });
  }
});

// Delete device model
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleteQuery = `DELETE FROM device_models WHERE id = $1 RETURNING *`;
    const result = await pool.query(deleteQuery, [parseInt(id)]);
    
    if (!result.rows || result.rows.length === 0) {
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

    const placeholders = ids.map((_, index) => `$${index + 1}`).join(',');
    const deleteQuery = `DELETE FROM device_models WHERE id IN (${placeholders}) RETURNING id`;
    
    const result = await pool.query(deleteQuery, ids.map(id => parseInt(id)));
    
    res.json({ message: `${result.rows.length} models deleted successfully` });
  } catch (error) {
    console.error('Error bulk deleting models:', error);
    res.status(500).json({ message: 'Failed to delete models' });
  }
});

export default router;