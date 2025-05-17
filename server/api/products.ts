import express, { Request, Response } from 'express';
import { pool } from '../db';

const router = express.Router();

// GET all products
router.get('/', async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT p.id, p.title as name, p.slug, p.description, p.price, p.device_model_id,
             dm.name AS model_name, b.name AS brand_name
      FROM products p
      LEFT JOIN device_models dm ON p.device_model_id = dm.id
      LEFT JOIN brands b ON dm.brand_id = b.id
      ORDER BY p.id
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
      SELECT p.id, p.title as name, p.slug, p.description, p.price, p.device_model_id,
             dm.name AS model_name, b.name AS brand_name
      FROM products p
      LEFT JOIN device_models dm ON p.device_model_id = dm.id
      LEFT JOIN brands b ON dm.brand_id = b.id
      WHERE p.id = $1
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