import express, { Request, Response } from 'express';
import { pool } from '../db';

const router = express.Router();

// GET all products (using device_models for product mapping)
router.get('/', async (req: Request, res: Response) => {
  try {
    // Use device_models instead of products table
    const query = `
      SELECT 
        dm.id, 
        dm.name, 
        dm.slug, 
        '' as description,
        0 as price,
        dm.id as device_model_id,
        dm.name AS model_name, 
        b.name AS brand_name
      FROM device_models dm
      LEFT JOIN brands b ON dm.brand_id = b.id
      WHERE dm.active = true
      ORDER BY dm.id
    `;
    
    const result = await pool.query(query);
    
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch products' });
  }
});

// GET a single product by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    const query = `
      SELECT 
        dm.id, 
        dm.name, 
        dm.slug, 
        '' as description,
        0 as price,
        dm.id as device_model_id,
        dm.name AS model_name, 
        b.name AS brand_name
      FROM device_models dm
      LEFT JOIN brands b ON dm.brand_id = b.id
      WHERE dm.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error(`Error fetching product with ID ${req.params.id}:`, error);
    res.status(500).json({ message: error.message || 'Failed to fetch product' });
  }
});

export default router;