import { Router } from 'express';
import { db, pool } from '../db.js';
import { deviceModels, deviceModelVariants, brands, deviceTypes } from '../../shared/schema.js';
import { eq, and, sql } from 'drizzle-orm';

const router = Router();

// Get variants for a specific device model
router.get('/:modelSlug', async (req, res) => {
  try {
    const { modelSlug } = req.params;
    console.log('Fetching variants for model:', modelSlug);
    
    // Get model info and variants
    const queryText = `
      SELECT 
        dm.id as model_id,
        dm.name as model_name,
        dm.slug as model_slug,
        dm.image as model_image,
        dm.base_price as model_base_price,
        dm.priority as model_priority,
        b.name as brand_name,
        dt.name as device_type_name,
        COALESCE(
          json_agg(
            CASE WHEN dmv.id IS NOT NULL THEN
              json_build_object(
                'id', dmv.id,
                'slug', LOWER(REPLACE(dmv.variant_name, ' ', '-')),
                'variantName', dmv.variant_name,
                'storage', dmv.storage,
                'color', dmv.color,
                'ram', dmv.ram,
                'basePrice', dmv.base_price,
                'currentPrice', dmv.current_price,
                'sku', dmv.sku,
                'availability', dmv.availability
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
      WHERE dm.slug = $1 AND dm.active = true
      GROUP BY dm.id, b.id, dt.id
    `;
    
    const result = await pool.query(queryText, [modelSlug]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Model not found' });
    }
    
    const row = result.rows[0];
    
    res.json({
      model: {
        id: row.model_id,
        name: row.model_name,
        slug: row.model_slug,
        image: row.model_image,
        basePrice: row.model_base_price,
        priority: row.model_priority,
        brandName: row.brand_name,
        deviceTypeName: row.device_type_name
      },
      variants: row.variants
    });
    
  } catch (error) {
    console.error('Error fetching variants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific variant details
router.get('/:modelSlug/:variantSlug', async (req, res) => {
  try {
    const { modelSlug, variantSlug } = req.params;
    console.log('Fetching variant details:', { modelSlug, variantSlug });
    
    // Convert slug back to variant name for lookup
    const variantName = variantSlug.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    const queryText = `
      SELECT 
        dm.id as model_id,
        dm.name as model_name,
        dm.slug as model_slug,
        dm.image as model_image,
        dm.base_price as model_base_price,
        dm.priority as model_priority,
        b.name as brand_name,
        dt.name as device_type_name,
        dmv.id as variant_id,
        dmv.variant_name,
        dmv.storage,
        dmv.color,
        dmv.ram,
        dmv.processor,
        dmv.display_size,
        dmv.base_price as variant_base_price,
        dmv.current_price as variant_current_price,
        dmv.market_value,
        dmv.sku,
        dmv.specifications,
        dmv.availability
      FROM device_models dm
      LEFT JOIN brands b ON dm.brand_id = b.id
      LEFT JOIN device_types dt ON dm.device_type_id = dt.id
      LEFT JOIN device_model_variants dmv ON dm.id = dmv.model_id 
      WHERE dm.slug = $1 
        AND dmv.active = true
        AND (
          LOWER(REPLACE(dmv.variant_name, ' ', '-')) = $2 
          OR dmv.variant_name = $3
        )
    `;
    
    const result = await pool.query(queryText, [modelSlug, variantSlug, variantName]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Variant not found' });
    }
    
    const row = result.rows[0];
    
    res.json({
      model: {
        id: row.model_id,
        name: row.model_name,
        slug: row.model_slug,
        image: row.model_image,
        basePrice: row.model_base_price,
        priority: row.model_priority,
        brandName: row.brand_name,
        deviceTypeName: row.device_type_name
      },
      variant: {
        id: row.variant_id,
        slug: variantSlug,
        variantName: row.variant_name,
        storage: row.storage,
        color: row.color,
        ram: row.ram,
        processor: row.processor,
        displaySize: row.display_size,
        basePrice: row.variant_base_price,
        currentPrice: row.variant_current_price,
        marketValue: row.market_value,
        sku: row.sku,
        specifications: row.specifications,
        availability: row.availability
      }
    });
    
  } catch (error) {
    console.error('Error fetching variant details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;