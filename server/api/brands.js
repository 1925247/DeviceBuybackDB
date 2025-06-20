import { Router } from 'express';
import { db } from '../db.js';
import { brands } from '../../shared/schema.js';
import { eq, sql } from 'drizzle-orm';

const router = Router();

// Get all brands or filter by device type
router.get('/', async (req, res) => {
  try {
    const { deviceType } = req.query;
    
    if (deviceType) {
      // Get brands that support the specific device type
      const result = await db.execute(`
        SELECT DISTINCT b.* 
        FROM brands b
        JOIN brand_device_types bdt ON b.id = bdt.brand_id
        JOIN device_types dt ON bdt.device_type_id = dt.id
        WHERE dt.slug = $1 AND b.active = true
        ORDER BY b.name
      `, [deviceType]);
      res.json(result.rows);
    } else {
      // Get all brands
      const result = await db.select().from(brands);
      res.json(result);
    }
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ message: 'Failed to fetch brands' });
  }
});

// Get brand by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await db.select().from(brands).where(eq(brands.id, parseInt(id))).limit(1);
    
    if (!brand.length) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    
    res.json(brand[0]);
  } catch (error) {
    console.error('Error fetching brand:', error);
    res.status(500).json({ message: 'Failed to fetch brand' });
  }
});

// Create new brand
router.post('/', async (req, res) => {
  try {
    const result = await db.insert(brands).values(req.body).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating brand:', error);
    res.status(500).json({ message: 'Failed to create brand' });
  }
});

// Update brand
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db
      .update(brands)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(brands.id, parseInt(id)))
      .returning();
    
    if (!result.length) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating brand:', error);
    res.status(500).json({ message: 'Failed to update brand' });
  }
});

// Delete brand
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
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