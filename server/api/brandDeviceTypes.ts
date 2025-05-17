import express, { Request, Response } from 'express';
import { db, pool } from '../db';
import { z } from 'zod';

const router = express.Router();

// GET all brand-device type associations
router.get('/', async (req: Request, res: Response) => {
  try {
    // Using raw query instead of Drizzle ORM to avoid schema issues
    const query = `
      SELECT bdt.id, bdt.brand_id, bdt.device_type_id, 
             b.name as brand_name, dt.name as device_type_name,
             bdt.created_at, bdt.updated_at
      FROM brand_device_types bdt
      JOIN brands b ON bdt.brand_id = b.id
      JOIN device_types dt ON bdt.device_type_id = dt.id
      ORDER BY dt.name, b.name
    `;
    
    const result = await pool.query(query);
    
    res.json({
      rows: result.rows,
      count: result.rowCount
    });
  } catch (error: any) {
    console.error('Error fetching brand-device types:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch brand-device types' });
  }
});

// POST create a new brand-device type association
router.post('/', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      brandId: z.number(),
      deviceTypeId: z.number()
    });
    
    const validatedData = schema.parse(req.body);
    
    // Check if the association already exists
    const checkQuery = `
      SELECT id FROM brand_device_types 
      WHERE brand_id = $1 AND device_type_id = $2
    `;
    
    const existingResult = await pool.query(checkQuery, [
      validatedData.brandId, 
      validatedData.deviceTypeId
    ]);
    
    if (existingResult.rows.length > 0) {
      return res.status(409).json({ 
        message: 'This brand is already associated with this device type' 
      });
    }
    
    // Create the new association
    const insertQuery = `
      INSERT INTO brand_device_types (brand_id, device_type_id, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      RETURNING id, brand_id, device_type_id, created_at, updated_at
    `;
    
    const result = await pool.query(insertQuery, [
      validatedData.brandId,
      validatedData.deviceTypeId
    ]);
    
    // Get the brand and device type names for the response
    const detailsQuery = `
      SELECT b.name AS brand_name, dt.name AS device_type_name
      FROM brands b, device_types dt
      WHERE b.id = $1 AND dt.id = $2
    `;
    
    const detailsResult = await pool.query(detailsQuery, [
      validatedData.brandId,
      validatedData.deviceTypeId
    ]);
    
    const association = {
      ...result.rows[0],
      brand_name: detailsResult.rows[0]?.brand_name,
      device_type_name: detailsResult.rows[0]?.device_type_name
    };
    
    res.status(201).json(association);
  } catch (error: any) {
    console.error('Error creating brand-device type association:', error);
    res.status(400).json({ message: error.message || 'Failed to create brand-device type association' });
  }
});

// DELETE a brand-device type association
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if the association exists
    const checkQuery = `
      SELECT id FROM brand_device_types WHERE id = $1
    `;
    
    const existingResult = await pool.query(checkQuery, [id]);
    
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Association not found' });
    }
    
    // Delete the association
    const deleteQuery = `
      DELETE FROM brand_device_types WHERE id = $1
      RETURNING id, brand_id, device_type_id
    `;
    
    const result = await pool.query(deleteQuery, [id]);
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error(`Error deleting brand-device type association:`, error);
    res.status(500).json({ message: error.message || 'Failed to delete brand-device type association' });
  }
});

export default router;