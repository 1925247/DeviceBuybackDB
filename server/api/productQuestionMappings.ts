import express, { Request, Response } from 'express';
import { pool } from '../db';
import { z } from 'zod';

const router = express.Router();

// GET all product-question mappings
router.get('/', async (req: Request, res: Response) => {
  try {
    const productId = req.query.productId ? parseInt(req.query.productId as string) : undefined;
    
    // Use raw query to avoid schema issues
    const query = `
      SELECT * FROM product_question_mappings
      ${productId ? 'WHERE product_id = $1' : ''}
      ORDER BY id
    `;
    
    const result = await pool.query(
      query,
      productId ? [productId] : []
    );
    
    const mappings = result.rows;
    
    res.json(mappings);
  } catch (error: any) {
    console.error('Error fetching product-question mappings:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch product-question mappings' });
  }
});

// Create product-question mappings by group
router.post('/by-group', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      productId: z.number(),
      groupId: z.number()
    });
    
    const validatedData = schema.parse(req.body);
    
    // Get all questions in the group
    const questionsQuery = `
      SELECT * FROM questions 
      WHERE group_id = $1
    `;
    
    const questionsResult = await pool.query(questionsQuery, [validatedData.groupId]);
    const questions = questionsResult.rows;
    
    // Check if we already have mappings for this product and group
    const checkQuery = `
      SELECT * FROM product_question_mappings
      WHERE product_id = $1 AND group_id = $2
    `;
    
    const checkResult = await pool.query(checkQuery, [
      validatedData.productId,
      validatedData.groupId
    ]);
    
    // If mappings already exist, return them
    if (checkResult.rowCount > 0) {
      return res.status(200).json({
        message: 'Mappings already exist for this product and question group',
        mappings: checkResult.rows
      });
    }
    
    // Create mappings for each question
    const insertPromises = questions.map(question => {
      const insertQuery = `
        INSERT INTO product_question_mappings
        (product_id, question_id, group_id, required, "order", created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING id, product_id, question_id, group_id, required, "order", created_at, updated_at
      `;
      
      return pool.query(insertQuery, [
        validatedData.productId,
        question.id,
        validatedData.groupId,
        question.required || false,
        question.order || 0
      ]);
    });
    
    const insertResults = await Promise.all(insertPromises);
    
    // Collect all the new mappings
    const newMappings = insertResults.map(result => result.rows[0]);
    
    res.status(201).json(newMappings);
  } catch (error: any) {
    console.error('Error creating product-question mappings:', error);
    res.status(400).json({ message: error.message || 'Failed to create product-question mappings' });
  }
});

// Copy product-question mappings from one product to another
router.post('/copy', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      sourceProductId: z.number(),
      targetProductId: z.number()
    });
    
    const validatedData = schema.parse(req.body);
    
    // Check if source product exists and has mappings
    const sourceQuery = `
      SELECT * FROM product_question_mappings
      WHERE product_id = $1
    `;
    
    const sourceResult = await pool.query(sourceQuery, [validatedData.sourceProductId]);
    
    if (sourceResult.rowCount === 0) {
      return res.status(404).json({ 
        message: 'Source product has no question mappings to copy' 
      });
    }
    
    // Check if target product already has mappings
    const targetQuery = `
      SELECT * FROM product_question_mappings
      WHERE product_id = $1
    `;
    
    const targetResult = await pool.query(targetQuery, [validatedData.targetProductId]);
    
    if (targetResult.rowCount > 0) {
      // Delete existing mappings for target product
      const deleteQuery = `
        DELETE FROM product_question_mappings
        WHERE product_id = $1
      `;
      
      await pool.query(deleteQuery, [validatedData.targetProductId]);
    }
    
    // Copy mappings from source to target
    const insertPromises = sourceResult.rows.map(mapping => {
      const insertQuery = `
        INSERT INTO product_question_mappings
        (product_id, question_id, group_id, required, "order", created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING id, product_id, question_id, group_id, required, "order", created_at, updated_at
      `;
      
      return pool.query(insertQuery, [
        validatedData.targetProductId,
        mapping.question_id,
        mapping.group_id,
        mapping.required,
        mapping.order
      ]);
    });
    
    const insertResults = await Promise.all(insertPromises);
    
    // Collect all the new mappings
    const newMappings = insertResults.map(result => result.rows[0]);
    
    res.status(201).json(newMappings);
  } catch (error: any) {
    console.error('Error copying product-question mappings:', error);
    res.status(400).json({ message: error.message || 'Failed to copy product-question mappings' });
  }
});

// Delete all mappings for a product
router.delete('/by-product/:productId', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.productId);
    
    const query = `
      DELETE FROM product_question_mappings
      WHERE product_id = $1
      RETURNING id, product_id
    `;
    
    const result = await pool.query(query, [productId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'No mappings found for this product' });
    }
    
    res.json({
      message: `Successfully deleted ${result.rowCount} mappings for product ${productId}`,
      deletedCount: result.rowCount
    });
  } catch (error: any) {
    console.error('Error deleting product-question mappings:', error);
    res.status(500).json({ message: error.message || 'Failed to delete product-question mappings' });
  }
});

export default router;