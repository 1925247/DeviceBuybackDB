import { Router } from 'express';
import { db, pool } from '../db.js';
import { eq, sql } from 'drizzle-orm';

const router = Router();

// Get all variants for a specific model
router.get('/model/:modelId', async (req, res) => {
  try {
    const { modelId } = req.params;
    
    const queryText = `
      SELECT 
        dmv.id, dmv.variant_name as name, dmv.storage, dmv.ram, dmv.color,
        dmv.base_price as "basePrice", dmv.current_price as "currentPrice",
        dmv.market_value as "marketValue", dmv.availability, dmv.active,
        dmv.created_at as "createdAt", dmv.updated_at as "updatedAt"
      FROM device_model_variants dmv
      WHERE dmv.model_id = $1 AND dmv.active = true
      ORDER BY dmv.base_price ASC
    `;
    
    const result = await pool.query(queryText, [parseInt(modelId)]);
    res.json(Array.isArray(result.rows) ? result.rows : []);
  } catch (error) {
    console.error('Error fetching model variants:', error);
    res.status(500).json({ error: 'Failed to fetch model variants' });
  }
});

// Create new variant
router.post('/', async (req, res) => {
  try {
    const {
      modelId,
      variantName,
      storage,
      ram,
      color,
      basePrice,
      currentPrice,
      marketValue,
      availability = true,
      active = true
    } = req.body;

    const queryText = `
      INSERT INTO device_model_variants (
        model_id, variant_name, storage, ram, color, base_price, current_price,
        market_value, availability, active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const result = await pool.query(queryText, [
      parseInt(modelId),
      variantName,
      storage,
      ram,
      color,
      parseFloat(basePrice),
      parseFloat(currentPrice || basePrice),
      parseFloat(marketValue || basePrice),
      availability,
      active
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating variant:', error);
    res.status(500).json({ error: 'Failed to create variant' });
  }
});

// Update variant
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      variantName,
      storage,
      ram,
      color,
      basePrice,
      currentPrice,
      marketValue,
      availability,
      active
    } = req.body;

    const queryText = `
      UPDATE device_model_variants SET
        variant_name = COALESCE($1, variant_name),
        storage = COALESCE($2, storage),
        ram = COALESCE($3, ram),
        color = COALESCE($4, color),
        base_price = COALESCE($5, base_price),
        current_price = COALESCE($6, current_price),
        market_value = COALESCE($7, market_value),
        availability = COALESCE($8, availability),
        active = COALESCE($9, active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `;

    const result = await pool.query(queryText, [
      variantName,
      storage,
      ram,
      color,
      basePrice ? parseFloat(basePrice) : null,
      currentPrice ? parseFloat(currentPrice) : null,
      marketValue ? parseFloat(marketValue) : null,
      availability,
      active,
      parseInt(id)
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Variant not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating variant:', error);
    res.status(500).json({ error: 'Failed to update variant' });
  }
});

// Delete variant
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const queryText = `
      UPDATE device_model_variants 
      SET active = false, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1
      RETURNING id
    `;
    
    const result = await pool.query(queryText, [parseInt(id)]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Variant not found' });
    }
    
    res.json({ message: 'Variant deleted successfully' });
  } catch (error) {
    console.error('Error deleting variant:', error);
    res.status(500).json({ error: 'Failed to delete variant' });
  }
});

// Get variant pricing statistics
router.get('/stats', async (req, res) => {
  try {
    const queryText = `
      SELECT 
        COUNT(*) as total_variants,
        AVG(base_price) as avg_base_price,
        MIN(base_price) as min_price,
        MAX(base_price) as max_price,
        COUNT(DISTINCT model_id) as models_with_variants
      FROM device_model_variants 
      WHERE active = true
    `;
    
    const result = await pool.query(queryText);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching variant stats:', error);
    res.status(500).json({ error: 'Failed to fetch variant statistics' });
  }
});

// Bulk update variant prices
router.post('/bulk-update-prices', async (req, res) => {
  try {
    const { variants, priceAdjustment } = req.body;
    
    if (!Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({ error: 'Variants array is required' });
    }

    const updatePromises = variants.map(variant => {
      const newPrice = variant.basePrice * (1 + priceAdjustment / 100);
      return pool.query(
        'UPDATE device_model_variants SET current_price = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newPrice, variant.id]
      );
    });

    await Promise.all(updatePromises);
    res.json({ message: 'Prices updated successfully' });
  } catch (error) {
    console.error('Error bulk updating prices:', error);
    res.status(500).json({ error: 'Failed to bulk update prices' });
  }
});

export default router;