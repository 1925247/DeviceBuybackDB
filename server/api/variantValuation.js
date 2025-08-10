/**
 * Variant-specific valuation API for device pricing
 */

import { pool } from "../db.js";

/**
 * Get variant-specific pricing for valuation
 */
export async function getVariantValuation(req, res) {
  try {
    const { model, variant } = req.params;
    
    console.log('Fetching variant valuation for:', { model, variant });
    
    const client = await pool.connect();
    try {
      // Get model details
      const modelQuery = `
        SELECT dm.*, b.name as brand_name, dt.name as device_type_name
        FROM device_models dm
        JOIN brands b ON dm.brand_id = b.id
        JOIN device_types dt ON dm.device_type_id = dt.id
        WHERE dm.slug = $1
      `;
      
      const modelResult = await client.query(modelQuery, [model]);
      
      if (modelResult.rows.length === 0) {
        return res.status(404).json({ error: 'Model not found' });
      }
      
      const modelData = modelResult.rows[0];
      
      // Get variant details and pricing - try exact match first
      let variantQuery = `
        SELECT dmv.*
        FROM device_model_variants dmv
        WHERE dmv.model_id = $1 AND dmv.variant_name = $2
      `;
      
      let variantResult = await client.query(variantQuery, [modelData.id, variant]);
      
      // If no exact match, try storage-based matching for variants like "128gb-blue" -> "128GB"
      if (variantResult.rows.length === 0) {
        const storageMatch = variant.match(/(\d+gb)/i);
        if (storageMatch) {
          const storage = storageMatch[1].toUpperCase();
          variantQuery = `
            SELECT dmv.*
            FROM device_model_variants dmv
            WHERE dmv.model_id = $1 AND (dmv.variant_name = $2 OR dmv.storage = $2)
          `;
          variantResult = await client.query(variantQuery, [modelData.id, storage]);
        }
      }
      
      if (variantResult.rows.length === 0) {
        return res.status(404).json({ error: 'Variant not found' });
      }
      
      const variantData = variantResult.rows[0];
      
      // Use exact pricing from admin panel - no hardcoded calculations
      const adminSetPrice = variantData.base_price || variantData.current_price || 0;
      
      res.json({
        model: modelData,
        variant: {
          ...variantData,
          // Use the exact price set in admin panel for customer display
          basePrice: adminSetPrice,
          currentPrice: variantData.current_price || adminSetPrice,
          marketValue: variantData.market_value || adminSetPrice,
          // Store admin-set price for frontend display
          adminSetPrice: adminSetPrice
        }
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error fetching variant valuation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Calculate variant-specific price with condition adjustments
 */
export async function calculateVariantPrice(req, res) {
  try {
    const { model, variant } = req.params;
    const { conditionAnswers, totalImpact } = req.body;
    
    console.log('Calculating variant price for:', { model, variant, totalImpact });
    
    const client = await pool.connect();
    try {
      // Get variant pricing (using the correct variant_pricing table)
      const variantQuery = `
        SELECT dmv.*, vp.base_price as pricing_base_price, vp.deduction_rate
        FROM device_model_variants dmv
        LEFT JOIN variant_pricing vp ON dmv.id = vp.variant_id AND vp.is_active = true
        WHERE dmv.model_id = (SELECT id FROM device_models WHERE slug = $1)
        AND dmv.variant_name = $2
      `;
      
      const variantResult = await client.query(variantQuery, [model, variant]);
      
      if (variantResult.rows.length === 0) {
        return res.status(404).json({ error: 'Variant not found' });
      }
      
      const variantData = variantResult.rows[0];
      
      // Calculate base price - prioritize pricing table, then variant table
      const basePrice = variantData.pricing_base_price || variantData.current_price || variantData.base_price || 300;
      const buybackBasePrice = Math.round(basePrice * 0.6); // 60% for buyback
      
      // Apply condition impact
      const adjustmentFactor = 1 + (totalImpact / 100);
      const finalPrice = Math.max(50, Math.round(buybackBasePrice * adjustmentFactor));
      
      // Calculate deduction
      const conditionDeduction = Math.round(buybackBasePrice * (Math.abs(totalImpact) / 100));
      
      res.json({
        basePrice: buybackBasePrice,
        conditionDeduction: conditionDeduction,
        deductionRate: Math.abs(totalImpact),
        finalPrice: finalPrice,
        variant: variantData
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error calculating variant price:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}