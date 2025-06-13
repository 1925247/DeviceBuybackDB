/**
 * Advanced model pricing management API
 */

import { pool } from '../db.js';

// Get all models with their pricing information
export async function getModelsWithPricing(req, res) {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          dm.id as model_id,
          dm.name as model_name,
          b.name as brand,
          dt.name as device_type,
          mp.id,
          mp.base_price,
          mp.deduction_rate,
          mp.is_active,
          mp.created_at,
          mp.updated_at,
          pt.name as pricing_tier
        FROM device_models dm
        LEFT JOIN brands b ON dm.brand_id = b.id
        LEFT JOIN device_types dt ON dm.device_type_id = dt.id
        LEFT JOIN model_pricing mp ON dm.id = mp.model_id
        LEFT JOIN pricing_tiers pt ON mp.pricing_tier_id = pt.id
        ORDER BY b.name, dm.name
      `);
      
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching models with pricing:', error);
    res.status(500).json({ error: 'Failed to fetch models with pricing' });
  }
}

// Create new model pricing
export async function createModelPricing(req, res) {
  try {
    const { modelId, basePrice, deductionRate, pricingTierId } = req.body;
    
    if (!modelId || !basePrice) {
      return res.status(400).json({ error: 'Model ID and base price are required' });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO model_pricing (model_id, base_price, deduction_rate, pricing_tier_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [modelId, basePrice, deductionRate || 0, pricingTierId || null]);
      
      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating model pricing:', error);
    if (error.code === '23505') {
      res.status(409).json({ error: 'Pricing already exists for this model' });
    } else {
      res.status(500).json({ error: 'Failed to create model pricing' });
    }
  }
}

// Update model pricing
export async function updateModelPricing(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const allowedFields = ['base_price', 'deduction_rate', 'pricing_tier_id', 'is_active'];
    const updateFields = [];
    const values = [];
    let valueIndex = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = $${valueIndex}`);
        values.push(value);
        valueIndex++;
      }
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const client = await pool.connect();
    try {
      const result = await client.query(`
        UPDATE model_pricing 
        SET ${updateFields.join(', ')}
        WHERE id = $${valueIndex}
        RETURNING *
      `, values);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Model pricing not found' });
      }
      
      res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating model pricing:', error);
    res.status(500).json({ error: 'Failed to update model pricing' });
  }
}

// Delete model pricing
export async function deleteModelPricing(req, res) {
  try {
    const { id } = req.params;
    
    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM model_pricing WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Model pricing not found' });
      }
      
      res.json({ message: 'Model pricing deleted successfully' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting model pricing:', error);
    res.status(500).json({ error: 'Failed to delete model pricing' });
  }
}

// Get pricing tiers
export async function getPricingTiers(req, res) {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT * FROM pricing_tiers 
        WHERE is_active = true 
        ORDER BY name
      `);
      
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching pricing tiers:', error);
    res.status(500).json({ error: 'Failed to fetch pricing tiers' });
  }
}

// Create pricing tier
export async function createPricingTier(req, res) {
  try {
    const { name, description, baseMultiplier, deductionRate } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Tier name is required' });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO pricing_tiers (name, description, base_multiplier, deduction_rate)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [name, description, baseMultiplier || 1.0, deductionRate || 0]);
      
      res.status(201).json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating pricing tier:', error);
    res.status(500).json({ error: 'Failed to create pricing tier' });
  }
}

// Calculate dynamic pricing for a model
export async function calculateModelPrice(req, res) {
  try {
    const { modelId, conditionAnswers = {} } = req.body;
    
    if (!modelId) {
      return res.status(400).json({ error: 'Model ID is required' });
    }

    const client = await pool.connect();
    try {
      // Get model pricing
      const pricingResult = await client.query(`
        SELECT 
          mp.*,
          pt.base_multiplier,
          pt.deduction_rate as tier_deduction_rate
        FROM model_pricing mp
        LEFT JOIN pricing_tiers pt ON mp.pricing_tier_id = pt.id
        WHERE mp.model_id = $1 AND mp.is_active = true
      `, [modelId]);
      
      if (pricingResult.rows.length === 0) {
        return res.status(404).json({ error: 'No pricing found for this model' });
      }
      
      const pricing = pricingResult.rows[0];
      let finalPrice = pricing.base_price;
      
      // Apply tier multiplier
      if (pricing.base_multiplier) {
        finalPrice *= pricing.base_multiplier;
      }
      
      // Apply base deduction rate
      const baseDeduction = finalPrice * (pricing.deduction_rate / 100);
      finalPrice -= baseDeduction;
      
      // Apply tier deduction rate
      if (pricing.tier_deduction_rate) {
        const tierDeduction = finalPrice * (pricing.tier_deduction_rate / 100);
        finalPrice -= tierDeduction;
      }
      
      // Apply condition-based deductions
      let conditionDeduction = 0;
      if (Object.keys(conditionAnswers).length > 0) {
        // Calculate average impact from condition answers
        const impacts = Object.values(conditionAnswers)
          .filter(answer => answer.priceImpact !== undefined)
          .map(answer => parseFloat(answer.priceImpact) || 0);
        
        if (impacts.length > 0) {
          const avgImpact = impacts.reduce((sum, impact) => sum + impact, 0) / impacts.length;
          conditionDeduction = finalPrice * Math.abs(avgImpact) / 100;
          finalPrice -= conditionDeduction;
        }
      }
      
      // Ensure minimum price
      const minimumPrice = 500; // ₹500 minimum
      finalPrice = Math.max(finalPrice, minimumPrice);
      
      const calculation = {
        modelId,
        basePrice: pricing.base_price,
        tierMultiplier: pricing.base_multiplier || 1.0,
        baseDeductionRate: pricing.deduction_rate,
        tierDeductionRate: pricing.tier_deduction_rate || 0,
        baseDeduction,
        tierDeduction: pricing.tier_deduction_rate ? finalPrice * (pricing.tier_deduction_rate / 100) : 0,
        conditionDeduction,
        finalPrice: Math.round(finalPrice),
        currency: 'INR'
      };
      
      res.json(calculation);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error calculating model price:', error);
    res.status(500).json({ error: 'Failed to calculate model price' });
  }
}

// Bulk update pricing
export async function bulkUpdatePricing(req, res) {
  try {
    const { updates } = req.body; // Array of { id, basePrice, deductionRate }
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'Updates array is required' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const results = [];
      for (const update of updates) {
        const { id, basePrice, deductionRate } = update;
        
        const result = await client.query(`
          UPDATE model_pricing 
          SET base_price = $1, deduction_rate = $2, updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
          RETURNING *
        `, [basePrice, deductionRate, id]);
        
        if (result.rows.length > 0) {
          results.push(result.rows[0]);
        }
      }
      
      await client.query('COMMIT');
      res.json({ updated: results.length, results });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error bulk updating pricing:', error);
    res.status(500).json({ error: 'Failed to bulk update pricing' });
  }
}