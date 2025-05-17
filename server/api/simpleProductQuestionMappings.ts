import express, { Request, Response } from 'express';
import { pool } from '../db';
import { z } from 'zod';

const router = express.Router();

// GET all product question mappings
router.get('/', async (req: Request, res: Response) => {
  try {
    const productId = req.query.productId ? parseInt(req.query.productId as string) : undefined;
    const groupId = req.query.groupId ? parseInt(req.query.groupId as string) : undefined;
    
    // First, we'll build a base query with proper joins
    let query = `
      SELECT pqm.*, 
        q.question_text, q.question_type, 
        g.name as group_name, 
        dm.name as product_name, 
        b.name as brand_name
      FROM product_question_mappings pqm
      INNER JOIN questions q ON pqm.question_id = q.id
      INNER JOIN question_groups g ON pqm.group_id = g.id
      INNER JOIN device_models dm ON pqm.product_id = dm.id
      INNER JOIN brands b ON dm.brand_id = b.id
    `;
    
    const queryParams = [];
    let paramIndex = 1;
    
    // Add filters if provided
    if (productId !== undefined) {
      query += queryParams.length === 0 ? ' WHERE' : ' AND';
      query += ` pqm.product_id = $${paramIndex++}`;
      queryParams.push(productId);
    }
    
    if (groupId !== undefined) {
      query += queryParams.length === 0 ? ' WHERE' : ' AND';
      query += ` pqm.group_id = $${paramIndex++}`;
      queryParams.push(groupId);
    }
    
    query += ' ORDER BY pqm.id';
    
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching product-question mappings:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch product-question mappings' });
  }
});

// Get mapping summary (grouped by product and question group)
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        dm.id as product_id, 
        dm.name as product_name,
        g.id as group_id,
        g.name as group_name,
        COUNT(pqm.id) as question_count,
        b.name as brand_name
      FROM product_question_mappings pqm
      INNER JOIN device_models dm ON pqm.product_id = dm.id
      INNER JOIN question_groups g ON pqm.group_id = g.id
      INNER JOIN brands b ON dm.brand_id = b.id
      GROUP BY dm.id, dm.name, g.id, g.name, b.name
      ORDER BY dm.name, g.name
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching product-question mapping summary:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch product-question mapping summary' });
  }
});

// Map a product to all questions in a group
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
    
    if (questions.length === 0) {
      return res.status(404).json({ message: 'No questions found in this group' });
    }
    
    // Check if we already have mappings for this product and group
    const checkQuery = `
      SELECT COUNT(*) FROM product_question_mappings
      WHERE product_id = $1 AND group_id = $2
    `;
    
    const checkResult = await pool.query(checkQuery, [
      validatedData.productId,
      validatedData.groupId
    ]);
    
    // If mappings already exist, delete them first to avoid duplicates
    if (parseInt(checkResult.rows[0].count) > 0) {
      const deleteQuery = `
        DELETE FROM product_question_mappings
        WHERE product_id = $1 AND group_id = $2
      `;
      
      await pool.query(deleteQuery, [
        validatedData.productId,
        validatedData.groupId
      ]);
    }
    
    // Create mappings for each question
    const insertQuery = `
      INSERT INTO product_question_mappings
      (product_id, question_id, group_id, required, "order", created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id
    `;
    
    const insertPromises = questions.map(question => {
      return pool.query(insertQuery, [
        validatedData.productId,
        question.id,
        validatedData.groupId,
        question.required || false,
        question.order || 0
      ]);
    });
    
    await Promise.all(insertPromises);
    
    // Get product and group details for the response
    const productQuery = `
      SELECT dm.name as product_name, b.name as brand_name
      FROM device_models dm
      JOIN brands b ON dm.brand_id = b.id
      WHERE dm.id = $1
    `;
    
    const groupQuery = `
      SELECT name as group_name FROM question_groups WHERE id = $1
    `;
    
    const [productResult, groupResult] = await Promise.all([
      pool.query(productQuery, [validatedData.productId]),
      pool.query(groupQuery, [validatedData.groupId])
    ]);
    
    const productName = productResult.rows[0]?.product_name || `Product ID ${validatedData.productId}`;
    const brandName = productResult.rows[0]?.brand_name;
    const groupName = groupResult.rows[0]?.group_name || `Group ID ${validatedData.groupId}`;
    
    res.status(201).json({
      message: `Successfully mapped ${productName} to "${groupName}" question group`,
      productId: validatedData.productId,
      productName,
      brandName,
      groupId: validatedData.groupId,
      groupName,
      questionCount: questions.length
    });
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
    
    // Check if source product has any mappings
    const checkQuery = `
      SELECT COUNT(*) FROM product_question_mappings
      WHERE product_id = $1
    `;
    
    const checkResult = await pool.query(checkQuery, [validatedData.sourceProductId]);
    
    if (parseInt(checkResult.rows[0].count) === 0) {
      return res.status(404).json({ 
        message: 'Source product has no question mappings to copy' 
      });
    }
    
    // Check if target product already has mappings
    const targetCheckQuery = `
      SELECT COUNT(*) FROM product_question_mappings
      WHERE product_id = $1
    `;
    
    const targetCheckResult = await pool.query(targetCheckQuery, [validatedData.targetProductId]);
    
    // If mappings already exist, delete them first
    if (parseInt(targetCheckResult.rows[0].count) > 0) {
      const deleteQuery = `
        DELETE FROM product_question_mappings
        WHERE product_id = $1
      `;
      
      await pool.query(deleteQuery, [validatedData.targetProductId]);
    }
    
    // Get source product mappings
    const sourceMappingsQuery = `
      SELECT * FROM product_question_mappings
      WHERE product_id = $1
    `;
    
    const sourceMappingsResult = await pool.query(sourceMappingsQuery, [validatedData.sourceProductId]);
    const sourceMappings = sourceMappingsResult.rows;
    
    // Create new mappings for target product
    if (sourceMappings.length > 0) {
      const insertQuery = `
        INSERT INTO product_question_mappings
        (product_id, question_id, group_id, required, "order", created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      `;
      
      const insertPromises = sourceMappings.map(mapping => {
        return pool.query(insertQuery, [
          validatedData.targetProductId,
          mapping.question_id,
          mapping.group_id,
          mapping.required,
          mapping.order
        ]);
      });
      
      await Promise.all(insertPromises);
    }
    
    // Get product details for the response
    const productQuery = `
      SELECT dm.name as product_name
      FROM device_models dm
      WHERE dm.id = $1
    `;
    
    const [sourceProductResult, targetProductResult] = await Promise.all([
      pool.query(productQuery, [validatedData.sourceProductId]),
      pool.query(productQuery, [validatedData.targetProductId])
    ]);
    
    const sourceProductName = sourceProductResult.rows[0]?.product_name || `Product ID ${validatedData.sourceProductId}`;
    const targetProductName = targetProductResult.rows[0]?.product_name || `Product ID ${validatedData.targetProductId}`;
    
    res.status(200).json({
      message: `Successfully copied ${sourceMappings.length} question mappings from ${sourceProductName} to ${targetProductName}`,
      sourceProductId: validatedData.sourceProductId,
      sourceProductName,
      targetProductId: validatedData.targetProductId,
      targetProductName,
      mappingsCount: sourceMappings.length
    });
  } catch (error: any) {
    console.error('Error copying product-question mappings:', error);
    res.status(400).json({ message: error.message || 'Failed to copy product-question mappings' });
  }
});

// Delete all mappings for a product
router.delete('/by-product/:productId', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.productId);
    
    // Check if product has any mappings
    const checkQuery = `
      SELECT COUNT(*) FROM product_question_mappings
      WHERE product_id = $1
    `;
    
    const checkResult = await pool.query(checkQuery, [productId]);
    const mappingCount = parseInt(checkResult.rows[0].count);
    
    if (mappingCount === 0) {
      return res.status(404).json({ 
        message: 'Product has no question mappings to delete' 
      });
    }
    
    // Delete the mappings
    const deleteQuery = `
      DELETE FROM product_question_mappings
      WHERE product_id = $1
    `;
    
    await pool.query(deleteQuery, [productId]);
    
    // Get product name for the response
    const productQuery = `
      SELECT name FROM device_models WHERE id = $1
    `;
    
    const productResult = await pool.query(productQuery, [productId]);
    const productName = productResult.rows[0]?.name || `Product ID ${productId}`;
    
    res.json({
      message: `Successfully deleted all question mappings for ${productName}`,
      productName,
      productId,
      deletedMappingsCount: mappingCount
    });
  } catch (error: any) {
    console.error(`Error deleting product-question mappings for product ID ${req.params.productId}:`, error);
    res.status(500).json({ message: error.message || 'Failed to delete product-question mappings' });
  }
});

// Delete a specific mapping by ID (for more granular control)
router.delete('/:mappingId', async (req: Request, res: Response) => {
  try {
    const mappingId = parseInt(req.params.mappingId);
    
    // Get mapping details before deletion for the response
    const getMappingQuery = `
      SELECT 
        pqm.id, pqm.product_id, pqm.question_id, pqm.group_id,
        dm.name as product_name,
        q.question_text,
        g.name as group_name
      FROM product_question_mappings pqm
      JOIN device_models dm ON pqm.product_id = dm.id
      JOIN questions q ON pqm.question_id = q.id
      JOIN question_groups g ON pqm.group_id = g.id
      WHERE pqm.id = $1
    `;
    
    const mappingResult = await pool.query(getMappingQuery, [mappingId]);
    
    if (mappingResult.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Mapping not found' 
      });
    }
    
    const mappingDetails = mappingResult.rows[0];
    
    // Delete the mapping
    const deleteQuery = `
      DELETE FROM product_question_mappings
      WHERE id = $1
    `;
    
    await pool.query(deleteQuery, [mappingId]);
    
    res.json({
      message: `Successfully deleted mapping between ${mappingDetails.product_name} and "${mappingDetails.question_text}"`,
      mappingId,
      productId: mappingDetails.product_id,
      productName: mappingDetails.product_name,
      questionId: mappingDetails.question_id,
      questionText: mappingDetails.question_text,
      groupId: mappingDetails.group_id,
      groupName: mappingDetails.group_name
    });
  } catch (error: any) {
    console.error(`Error deleting product-question mapping ID ${req.params.mappingId}:`, error);
    res.status(500).json({ message: error.message || 'Failed to delete product-question mapping' });
  }
});

// Update a specific mapping (for editing impact multipliers, required status, etc.)
router.patch('/:mappingId', async (req: Request, res: Response) => {
  try {
    const mappingId = parseInt(req.params.mappingId);
    
    const schema = z.object({
      required: z.boolean().optional(),
      impact_multiplier: z.number().min(0).max(10).optional(),
      order: z.number().min(0).optional(),
      active: z.boolean().optional()
    });
    
    const validatedData = schema.parse(req.body);
    
    // Build update query based on provided fields
    const updateFields = [];
    const queryParams = [mappingId];
    let paramIndex = 2;
    
    if (validatedData.required !== undefined) {
      updateFields.push(`required = $${paramIndex++}`);
      queryParams.push(validatedData.required);
    }
    
    if (validatedData.impact_multiplier !== undefined) {
      updateFields.push(`impact_multiplier = $${paramIndex++}`);
      queryParams.push(validatedData.impact_multiplier);
    }
    
    if (validatedData.order !== undefined) {
      updateFields.push(`"order" = $${paramIndex++}`);
      queryParams.push(validatedData.order);
    }
    
    if (validatedData.active !== undefined) {
      updateFields.push(`active = $${paramIndex++}`);
      queryParams.push(validatedData.active);
    }
    
    // Add updated_at timestamp
    updateFields.push(`updated_at = NOW()`);
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update provided' });
    }
    
    const updateQuery = `
      UPDATE product_question_mappings
      SET ${updateFields.join(', ')}
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, queryParams);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Mapping not found' });
    }
    
    // Get mapping details with related information
    const getMappingQuery = `
      SELECT 
        pqm.*, 
        dm.name as product_name,
        q.question_text,
        g.name as group_name
      FROM product_question_mappings pqm
      JOIN device_models dm ON pqm.product_id = dm.id
      JOIN questions q ON pqm.question_id = q.id
      JOIN question_groups g ON pqm.group_id = g.id
      WHERE pqm.id = $1
    `;
    
    const mappingResult = await pool.query(getMappingQuery, [mappingId]);
    const mappingDetails = mappingResult.rows[0];
    
    res.json({
      message: 'Mapping updated successfully',
      mapping: mappingDetails
    });
  } catch (error: any) {
    console.error(`Error updating product-question mapping ID ${req.params.mappingId}:`, error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Invalid data provided', details: error.errors });
    }
    
    res.status(500).json({ message: error.message || 'Failed to update product-question mapping' });
  }
});

export default router;