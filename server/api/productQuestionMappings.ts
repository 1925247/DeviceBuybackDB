import express, { Request, Response } from 'express';
import { pool } from '../db';
import { z } from 'zod';

const router = express.Router();

// GET all product question mappings
router.get('/', async (req: Request, res: Response) => {
  try {
    const productId = req.query.productId ? parseInt(req.query.productId as string) : undefined;
    const groupId = req.query.groupId ? parseInt(req.query.groupId as string) : undefined;
    
    let query = `
      SELECT pqm.*,
      (
        SELECT json_build_object(
          'id', q.id,
          'questionText', q.question_text,
          'groupId', q.group_id,
          'active', q.active,
          'questionType', q.question_type,
          'order', q."order"
        )
        FROM questions q
        WHERE q.id = pqm.question_id
      ) as question,
      (
        SELECT json_build_object(
          'id', g.id,
          'name', g.name,
          'statement', g.statement
        )
        FROM question_groups g
        WHERE g.id = pqm.group_id
      ) as question_group,
      (
        SELECT json_build_object(
          'id', dm.id,
          'name', dm.name,
          'brand', (
            SELECT b.name
            FROM brands b
            WHERE b.id = dm.brand_id
          )
        )
        FROM device_models dm
        WHERE dm.id = pqm.product_id
      ) as product
      FROM product_question_mappings pqm
    `;
    
    const queryParams = [];
    let paramIndex = 1;
    
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

// Create product-question mappings by group
router.post('/by-group', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      productId: z.number(),
      groupId: z.number(),
      actionType: z.string().optional()
    });
    
    const validatedData = schema.parse(req.body);
    
    // Get all questions in the group
    const questionsQuery = `
      SELECT q.*, 
      (
        SELECT json_agg(
          json_build_object(
            'id', ac.id,
            'questionId', ac.question_id,
            'text', ac.text,
            'value', ac.value,
            'order', ac.order,
            'impactMultiplier', ac.impact_multiplier
          )
        )
        FROM answer_choices ac
        WHERE ac.question_id = q.id
      ) as answer_choices
      FROM questions q
      WHERE q.group_id = $1
    `;
    
    const questionsResult = await pool.query(questionsQuery, [validatedData.groupId]);
    const questions = questionsResult.rows;
    
    // Check if we already have mappings for this product and group
    const checkQuery = `
      SELECT pqm.*,
      (
        SELECT json_agg(
          json_build_object(
            'id', pdr.id,
            'mappingId', pdr.mapping_id,
            'answerChoiceId', pdr.answer_choice_id,
            'deductionRate', pdr.deduction_rate
          )
        )
        FROM product_deduction_rates pdr
        WHERE pdr.mapping_id = pqm.id
      ) as deduction_rates
      FROM product_question_mappings pqm
      WHERE pqm.product_id = $1 AND pqm.group_id = $2
    `;
    
    const checkResult = await pool.query(checkQuery, [
      validatedData.productId,
      validatedData.groupId
    ]);
    
    // If mappings already exist, return them
    if (checkResult.rowCount && checkResult.rowCount > 0) {
      // If we're just viewing existing mappings
      if (!validatedData.actionType || validatedData.actionType === 'view') {
        return res.status(200).json({
          message: 'Mappings already exist for this product and question group',
          mappings: checkResult.rows
        });
      } 
      // If we're updating existing mappings, delete them first
      else if (validatedData.actionType === 'update') {
        // First delete any existing deduction rates
        const deleteDeductionRatesQuery = `
          DELETE FROM product_deduction_rates
          WHERE mapping_id IN (
            SELECT id FROM product_question_mappings
            WHERE product_id = $1 AND group_id = $2
          )
        `;
        
        await pool.query(deleteDeductionRatesQuery, [
          validatedData.productId,
          validatedData.groupId
        ]);
        
        // Then delete the mappings
        const deleteQuery = `
          DELETE FROM product_question_mappings
          WHERE product_id = $1 AND group_id = $2
        `;
        
        await pool.query(deleteQuery, [
          validatedData.productId,
          validatedData.groupId
        ]);
      }
    }
    
    // Create mappings for each question
    const insertPromises = questions.map(async (question) => {
      const insertQuery = `
        INSERT INTO product_question_mappings
        (product_id, question_id, group_id, required, "order", created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING id, product_id as "productId", question_id as "questionId", 
                  group_id as "groupId", required, "order", 
                  created_at as "createdAt", updated_at as "updatedAt"
      `;
      
      const params = [
        validatedData.productId,
        question.id,
        validatedData.groupId,
        question.required || false,
        question.order || 0
      ];
      
      const result = await pool.query(insertQuery, params);
      const mapping = result.rows[0];
      
      // If the question has answer choices, create default deduction rates (0%)
      if (question.answer_choices && question.answer_choices.length > 0) {
        const deductionRatePromises = question.answer_choices.map(async (choice: any) => {
          const insertDeductionRateQuery = `
            INSERT INTO product_deduction_rates
            (mapping_id, answer_choice_id, deduction_rate, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
            RETURNING id, mapping_id as "mappingId", answer_choice_id as "answerChoiceId", 
                      deduction_rate as "deductionRate",
                      created_at as "createdAt", updated_at as "updatedAt"
          `;
          
          const deductionResult = await pool.query(insertDeductionRateQuery, [
            mapping.id,
            choice.id,
            0 // Default deduction rate of 0%
          ]);
          
          return deductionResult.rows[0];
        });
        
        const deductionRates = await Promise.all(deductionRatePromises);
        mapping.deductionRates = deductionRates;
      }
      
      return mapping;
    });
    
    const newMappings = await Promise.all(insertPromises);
    
    // Get product and group names for the response
    const productQuery = `
      SELECT name FROM device_models WHERE id = $1
    `;
    
    const groupQuery = `
      SELECT name FROM question_groups WHERE id = $1
    `;
    
    const [productResult, groupResult] = await Promise.all([
      pool.query(productQuery, [validatedData.productId]),
      pool.query(groupQuery, [validatedData.groupId])
    ]);
    
    const productName = productResult.rows[0]?.name || `Product ID ${validatedData.productId}`;
    const groupName = groupResult.rows[0]?.name || `Group ID ${validatedData.groupId}`;
    
    res.status(201).json({
      message: `Successfully mapped ${productName} to "${groupName}" question group.`,
      productName,
      groupName,
      productId: validatedData.productId,
      groupId: validatedData.groupId,
      mappings: newMappings,
      questionCount: newMappings.length
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
      SELECT * FROM product_question_mappings
      WHERE product_id = $1
    `;
    
    const checkResult = await pool.query(checkQuery, [validatedData.sourceProductId]);
    
    if (checkResult.rowCount === 0) {
      return res.status(404).json({ 
        message: 'Source product has no question mappings to copy' 
      });
    }
    
    // Check if target product already has mappings
    const targetCheckQuery = `
      SELECT * FROM product_question_mappings
      WHERE product_id = $1
    `;
    
    const targetCheckResult = await pool.query(targetCheckQuery, [validatedData.targetProductId]);
    
    if (targetCheckResult.rowCount && targetCheckResult.rowCount > 0) {
      // Delete existing deduction rates for target product
      const deleteDeductionRatesQuery = `
        DELETE FROM product_deduction_rates
        WHERE mapping_id IN (
          SELECT id FROM product_question_mappings
          WHERE product_id = $1
        )
      `;
      
      await pool.query(deleteDeductionRatesQuery, [validatedData.targetProductId]);
      
      // Delete existing mappings for target product
      const deleteQuery = `
        DELETE FROM product_question_mappings
        WHERE product_id = $1
      `;
      
      await pool.query(deleteQuery, [validatedData.targetProductId]);
    }
    
    // Get source product mappings with detailed info
    const sourceMappingsQuery = `
      SELECT pqm.*, 
      (
        SELECT json_agg(
          json_build_object(
            'id', pdr.id,
            'mappingId', pdr.mapping_id,
            'answerChoiceId', pdr.answer_choice_id,
            'deductionRate', pdr.deduction_rate
          )
        )
        FROM product_deduction_rates pdr
        WHERE pdr.mapping_id = pqm.id
      ) as deduction_rates
      FROM product_question_mappings pqm
      WHERE pqm.product_id = $1
    `;
    
    const sourceMappingsResult = await pool.query(sourceMappingsQuery, [validatedData.sourceProductId]);
    const sourceMappings = sourceMappingsResult.rows;
    
    // Create new mappings for target product
    const newMappings = [];
    
    for (const mapping of sourceMappings) {
      const insertQuery = `
        INSERT INTO product_question_mappings
        (product_id, question_id, group_id, required, "order", created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING id, product_id as "productId", question_id as "questionId", 
                  group_id as "groupId", required, "order", 
                  created_at as "createdAt", updated_at as "updatedAt"
      `;
      
      const result = await pool.query(insertQuery, [
        validatedData.targetProductId,
        mapping.question_id,
        mapping.group_id,
        mapping.required,
        mapping.order
      ]);
      
      const newMapping = result.rows[0];
      
      // Copy deduction rates if they exist
      if (mapping.deduction_rates && mapping.deduction_rates.length > 0) {
        const deductionRates = [];
        
        for (const rate of mapping.deduction_rates) {
          const insertRateQuery = `
            INSERT INTO product_deduction_rates
            (mapping_id, answer_choice_id, deduction_rate, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
            RETURNING id, mapping_id as "mappingId", answer_choice_id as "answerChoiceId", 
                      deduction_rate as "deductionRate",
                      created_at as "createdAt", updated_at as "updatedAt"
          `;
          
          const rateResult = await pool.query(insertRateQuery, [
            newMapping.id,
            rate.answerChoiceId,
            rate.deductionRate
          ]);
          
          deductionRates.push(rateResult.rows[0]);
        }
        
        newMapping.deductionRates = deductionRates;
      }
      
      newMappings.push(newMapping);
    }
    
    // Get product names for the response
    const sourceProductQuery = `
      SELECT name FROM device_models WHERE id = $1
    `;
    
    const targetProductQuery = `
      SELECT name FROM device_models WHERE id = $1
    `;
    
    const [sourceProductResult, targetProductResult] = await Promise.all([
      pool.query(sourceProductQuery, [validatedData.sourceProductId]),
      pool.query(targetProductQuery, [validatedData.targetProductId])
    ]);
    
    const sourceProductName = sourceProductResult.rows[0]?.name || `Product ID ${validatedData.sourceProductId}`;
    const targetProductName = targetProductResult.rows[0]?.name || `Product ID ${validatedData.targetProductId}`;
    
    res.status(201).json({
      message: `Successfully copied ${newMappings.length} question mappings from ${sourceProductName} to ${targetProductName}`,
      sourceProductName,
      targetProductName,
      sourceProductId: validatedData.sourceProductId,
      targetProductId: validatedData.targetProductId,
      mappingsCount: newMappings.length,
      mappings: newMappings
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
    
    // Delete deduction rates first
    const deleteDeductionRatesQuery = `
      DELETE FROM product_deduction_rates
      WHERE mapping_id IN (
        SELECT id FROM product_question_mappings
        WHERE product_id = $1
      )
    `;
    
    await pool.query(deleteDeductionRatesQuery, [productId]);
    
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

// Update deduction rates for a specific mapping
router.put('/:id/deduction-rates', async (req: Request, res: Response) => {
  try {
    const mappingId = parseInt(req.params.id);
    
    const schema = z.object({
      deductionRates: z.array(
        z.object({
          answerChoiceId: z.number(),
          deductionRate: z.number().min(0).max(100)
        })
      )
    });
    
    const validatedData = schema.parse(req.body);
    
    // Check if mapping exists
    const checkQuery = `
      SELECT * FROM product_question_mappings
      WHERE id = $1
    `;
    
    const checkResult = await pool.query(checkQuery, [mappingId]);
    
    if (checkResult.rowCount === 0) {
      return res.status(404).json({ message: 'Mapping not found' });
    }
    
    // Delete existing deduction rates for this mapping
    const deleteQuery = `
      DELETE FROM product_deduction_rates
      WHERE mapping_id = $1
    `;
    
    await pool.query(deleteQuery, [mappingId]);
    
    // Insert new deduction rates
    const insertPromises = validatedData.deductionRates.map(async (rate) => {
      const insertQuery = `
        INSERT INTO product_deduction_rates
        (mapping_id, answer_choice_id, deduction_rate, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        RETURNING id, mapping_id as "mappingId", answer_choice_id as "answerChoiceId", 
                  deduction_rate as "deductionRate",
                  created_at as "createdAt", updated_at as "updatedAt"
      `;
      
      const result = await pool.query(insertQuery, [
        mappingId,
        rate.answerChoiceId,
        rate.deductionRate
      ]);
      
      return result.rows[0];
    });
    
    const newRates = await Promise.all(insertPromises);
    
    // Get mapping details for response
    const mapping = checkResult.rows[0];
    const productQuery = `
      SELECT name FROM device_models WHERE id = $1
    `;
    
    const questionQuery = `
      SELECT question_text FROM questions WHERE id = $1
    `;
    
    const [productResult, questionResult] = await Promise.all([
      pool.query(productQuery, [mapping.product_id]),
      pool.query(questionQuery, [mapping.question_id])
    ]);
    
    const productName = productResult.rows[0]?.name || `Product ID ${mapping.product_id}`;
    const questionText = questionResult.rows[0]?.question_text || `Question ID ${mapping.question_id}`;
    
    res.json({
      message: `Successfully updated deduction rates for ${productName} - "${questionText}"`,
      mappingId,
      productId: mapping.product_id,
      productName,
      questionId: mapping.question_id,
      questionText,
      deductionRates: newRates
    });
  } catch (error: any) {
    console.error(`Error updating deduction rates for mapping ID ${req.params.id}:`, error);
    res.status(400).json({ message: error.message || 'Failed to update deduction rates' });
  }
});

export default router;