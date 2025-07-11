import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// Get all variants with pricing information
router.get('/', async (req, res) => {
  try {
    const { brandId, deviceTypeId, modelId, search } = req.query;
    
    let queryText = `
      SELECT 
        dmv.id,
        dmv.variant_name,
        dmv.storage,
        dmv.color,
        dmv.ram,
        dmv.processor,
        dmv.base_price,
        dmv.current_price,
        dmv.market_value,
        dmv.availability,
        dmv.sku,
        dm.id as model_id,
        dm.name as model_name,
        dm.slug as model_slug,
        b.id as brand_id,
        b.name as brand_name,
        dt.id as device_type_id,
        dt.name as device_type_name
      FROM device_model_variants dmv
      JOIN device_models dm ON dmv.model_id = dm.id
      JOIN brands b ON dm.brand_id = b.id
      JOIN device_types dt ON dm.device_type_id = dt.id
      WHERE dmv.active = true AND dm.active = true
    `;
    
    const params = [];
    let paramIndex = 1;

    if (brandId) {
      queryText += ` AND b.id = $${paramIndex}`;
      params.push(brandId);
      paramIndex++;
    }

    if (deviceTypeId) {
      queryText += ` AND dt.id = $${paramIndex}`;
      params.push(deviceTypeId);
      paramIndex++;
    }

    if (modelId) {
      queryText += ` AND dm.id = $${paramIndex}`;
      params.push(modelId);
      paramIndex++;
    }

    if (search) {
      queryText += ` AND (
        LOWER(dm.name) LIKE LOWER($${paramIndex}) OR 
        LOWER(dmv.variant_name) LIKE LOWER($${paramIndex}) OR
        LOWER(b.name) LIKE LOWER($${paramIndex})
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    queryText += ` ORDER BY b.name, dm.name, dmv.base_price ASC`;

    const result = await pool.query(queryText, params);
    
    const variants = result.rows.map(row => ({
      id: row.id,
      variantName: row.variant_name,
      storage: row.storage,
      color: row.color,
      ram: row.ram,
      processor: row.processor,
      basePrice: row.base_price,
      currentPrice: row.current_price,
      marketValue: row.market_value,
      availability: row.availability,
      sku: row.sku,
      modelId: row.model_id,
      modelName: row.model_name,
      modelSlug: row.model_slug,
      brandId: row.brand_id,
      brandName: row.brand_name,
      deviceTypeId: row.device_type_id,
      deviceTypeName: row.device_type_name
    }));

    res.json(variants);
    
  } catch (error) {
    console.error('Error fetching variants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update variant pricing
router.put('/:variantId', async (req, res) => {
  try {
    const { variantId } = req.params;
    const { basePrice, currentPrice, marketValue } = req.body;

    const queryText = `
      UPDATE device_model_variants 
      SET 
        base_price = $1,
        current_price = $2,
        market_value = $3,
        updated_at = NOW()
      WHERE id = $4 AND active = true
      RETURNING *
    `;

    const result = await pool.query(queryText, [
      basePrice,
      currentPrice,
      marketValue,
      variantId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Variant not found' });
    }

    res.json({
      message: 'Variant pricing updated successfully',
      variant: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating variant pricing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk update pricing
router.post('/bulk-update', async (req, res) => {
  try {
    const { percentage, operation, filters } = req.body;
    
    if (!percentage || !operation) {
      return res.status(400).json({ error: 'Percentage and operation are required' });
    }

    const multiplier = operation === 'increase' ? (1 + percentage / 100) : (1 - percentage / 100);
    
    let queryText = `
      UPDATE device_model_variants 
      SET 
        base_price = ROUND(base_price * $1, 2),
        current_price = ROUND(current_price * $1, 2),
        market_value = ROUND(market_value * $1, 2),
        updated_at = NOW()
      FROM device_models dm, brands b, device_types dt
      WHERE device_model_variants.model_id = dm.id 
        AND dm.brand_id = b.id 
        AND dm.device_type_id = dt.id
        AND device_model_variants.active = true 
        AND dm.active = true
    `;

    const params = [multiplier];
    let paramIndex = 2;

    if (filters.brandId) {
      queryText += ` AND b.id = $${paramIndex}`;
      params.push(filters.brandId);
      paramIndex++;
    }

    if (filters.deviceTypeId) {
      queryText += ` AND dt.id = $${paramIndex}`;
      params.push(filters.deviceTypeId);
      paramIndex++;
    }

    if (filters.modelId) {
      queryText += ` AND dm.id = $${paramIndex}`;
      params.push(filters.modelId);
      paramIndex++;
    }

    const result = await pool.query(queryText, params);

    res.json({
      message: `Successfully updated ${result.rowCount} variants`,
      operation,
      percentage,
      affectedRows: result.rowCount
    });

  } catch (error) {
    console.error('Error in bulk update:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pricing statistics
router.get('/stats', async (req, res) => {
  try {
    const queryText = `
      SELECT 
        COUNT(*) as total_variants,
        AVG(base_price) as avg_base_price,
        MIN(base_price) as min_base_price,
        MAX(base_price) as max_base_price,
        AVG(current_price) as avg_current_price,
        MIN(current_price) as min_current_price,
        MAX(current_price) as max_current_price,
        COUNT(CASE WHEN availability = true THEN 1 END) as available_variants,
        COUNT(CASE WHEN availability = false THEN 1 END) as unavailable_variants
      FROM device_model_variants dmv
      JOIN device_models dm ON dmv.model_id = dm.id
      WHERE dmv.active = true AND dm.active = true
    `;

    const result = await pool.query(queryText);
    
    res.json({
      totalVariants: parseInt(result.rows[0].total_variants),
      avgBasePrice: parseFloat(result.rows[0].avg_base_price) || 0,
      minBasePrice: parseFloat(result.rows[0].min_base_price) || 0,
      maxBasePrice: parseFloat(result.rows[0].max_base_price) || 0,
      avgCurrentPrice: parseFloat(result.rows[0].avg_current_price) || 0,
      minCurrentPrice: parseFloat(result.rows[0].min_current_price) || 0,
      maxCurrentPrice: parseFloat(result.rows[0].max_current_price) || 0,
      availableVariants: parseInt(result.rows[0].available_variants),
      unavailableVariants: parseInt(result.rows[0].unavailable_variants)
    });

  } catch (error) {
    console.error('Error fetching pricing stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;