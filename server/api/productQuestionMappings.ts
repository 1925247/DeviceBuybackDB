import express, { Request, Response } from 'express';
import { db } from '../db';
import { productQuestionMappings, products, questions, questionGroups } from '@shared/schema';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { z } from 'zod';

const router = express.Router();

// GET all product-question mappings
router.get('/', async (req: Request, res: Response) => {
  try {
    const productId = req.query.productId ? parseInt(req.query.productId as string) : undefined;
    
    // Simplified query to avoid schema issues
    let query = db.select()
        .from(productQuestionMappings);
    
    if (productId) {
      query = query.where(eq(productQuestionMappings.productId, productId));
    }
    
    const mappings = await query;
    
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
      groupId: z.number(),
      required: z.boolean().default(true),
      impactMultiplier: z.number().default(1)
    });
    
    const validatedData = schema.parse(req.body);
    
    // Start a transaction
    const result = await db.transaction(async (tx) => {
      // Check if product exists
      const [product] = await tx.select()
        .from(products)
        .where(eq(products.id, validatedData.productId));
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      // Check if question group exists
      const [group] = await tx.select()
        .from(questionGroups)
        .where(eq(questionGroups.id, validatedData.groupId));
      
      if (!group) {
        throw new Error('Question group not found');
      }
      
      // Get all questions in the group
      const questionsInGroup = await tx.select()
        .from(questions)
        .where(eq(questions.groupId, validatedData.groupId));
      
      if (questionsInGroup.length === 0) {
        throw new Error('Question group has no questions');
      }
      
      // Map each question to the product
      const mappings = [];
      
      for (const question of questionsInGroup) {
        // Check if mapping already exists
        const [existingMapping] = await tx.select()
          .from(productQuestionMappings)
          .where(and(
            eq(productQuestionMappings.productId, validatedData.productId),
            eq(productQuestionMappings.questionId, question.id)
          ));
        
        if (!existingMapping) {
          const [newMapping] = await tx.insert(productQuestionMappings)
            .values({
              productId: validatedData.productId,
              questionId: question.id,
              groupId: validatedData.groupId,
              required: validatedData.required,
              impactMultiplier: validatedData.impactMultiplier,
              createdAt: new Date(),
              updatedAt: new Date()
            })
            .returning();
          
          mappings.push(newMapping);
        }
      }
      
      return mappings;
    });
    
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Error creating product-question mappings by group:', error);
    res.status(400).json({ message: error.message || 'Failed to create product-question mappings' });
  }
});

// Copy product-question mappings
router.post('/copy', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      sourceProductId: z.number(),
      targetProductId: z.number()
    });
    
    const validatedData = schema.parse(req.body);
    
    // Start a transaction
    const result = await db.transaction(async (tx) => {
      // Check if source product exists and has mappings
      const [sourceProduct] = await tx.select()
        .from(products)
        .where(eq(products.id, validatedData.sourceProductId));
      
      if (!sourceProduct) {
        throw new Error('Source product not found');
      }
      
      // Check if target product exists
      const [targetProduct] = await tx.select()
        .from(products)
        .where(eq(products.id, validatedData.targetProductId));
      
      if (!targetProduct) {
        throw new Error('Target product not found');
      }
      
      // Get source product mappings
      const sourceMappings = await tx.select()
        .from(productQuestionMappings)
        .where(eq(productQuestionMappings.productId, validatedData.sourceProductId));
      
      if (sourceMappings.length === 0) {
        throw new Error('Source product has no question mappings to copy');
      }
      
      // Copy mappings to target product
      const newMappings = [];
      
      for (const mapping of sourceMappings) {
        // Check if mapping already exists for target product
        const [existingMapping] = await tx.select()
          .from(productQuestionMappings)
          .where(and(
            eq(productQuestionMappings.productId, validatedData.targetProductId),
            eq(productQuestionMappings.questionId, mapping.questionId)
          ));
        
        if (!existingMapping) {
          const [newMapping] = await tx.insert(productQuestionMappings)
            .values({
              productId: validatedData.targetProductId,
              questionId: mapping.questionId,
              groupId: mapping.groupId,
              required: mapping.required,
              impactMultiplier: mapping.impactMultiplier,
              createdAt: new Date(),
              updatedAt: new Date()
            })
            .returning();
          
          newMappings.push(newMapping);
        }
      }
      
      return newMappings;
    });
    
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Error copying product-question mappings:', error);
    res.status(400).json({ message: error.message || 'Failed to copy product-question mappings' });
  }
});

// Delete product-question mappings
router.delete('/by-product/:productId', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.productId);
    
    // Check if product exists
    const [product] = await db.select()
      .from(products)
      .where(eq(products.id, productId));
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Delete all mappings for this product
    const deletedMappings = await db.delete(productQuestionMappings)
      .where(eq(productQuestionMappings.productId, productId))
      .returning();
    
    res.json(deletedMappings);
  } catch (error: any) {
    console.error(`Error deleting product-question mappings for product ${req.params.productId}:`, error);
    res.status(500).json({ message: error.message || 'Failed to delete product-question mappings' });
  }
});

export default router;