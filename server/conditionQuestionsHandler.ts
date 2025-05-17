import { Request, Response } from "express";
import { pool } from "./db";

// Define interfaces for condition questions and options
interface ConditionOption {
  id: number;
  text?: string;
  answer?: string;
  value: string | number;
}

interface ConditionQuestion {
  id: number;
  question: string;
  deviceTypeId: number;
  order: number;
  active: boolean;
  options: ConditionOption[];
}

/**
 * Handles fetching condition questions for device assessment
 */
export async function getConditionQuestions(req: Request, res: Response) {
  try {
    const deviceTypeId = req.query.deviceTypeId ? Number(req.query.deviceTypeId) : undefined;
    const modelId = req.query.modelId ? Number(req.query.modelId) : undefined;
    const modelName = req.query.model ? String(req.query.model) : undefined;
    const modelSlug = req.query.modelSlug ? String(req.query.modelSlug) : undefined;
    
    let questionsData: ConditionQuestion[] = [];
    
    // If no model ID is provided, return empty array
    if (!modelId) {
      return res.json(questionsData);
    }
    
    // Special handling for Samsung Galaxy S21
    if ((modelId === 2 || modelId === 6) && 
        (modelName === 'Samsung Galaxy S21' || modelSlug === 'samsung-galaxy-s21')) {
      console.log('Handling Samsung Galaxy S21 condition questions');
      
      // Get the product ID for Samsung Galaxy S21
      const productResult = await pool.query(
        `SELECT id FROM products WHERE title = 'Samsung Galaxy S21'`
      );
      
      let samsungProductId = null;
      if (productResult.rows.length > 0) {
        samsungProductId = productResult.rows[0].id;
        console.log(`Found Samsung Galaxy S21 product with ID: ${samsungProductId}`);
      } else {
        console.log('No product found for Samsung Galaxy S21');
        return res.json([]);
      }
      
      // Get all questions mapped to this product
      const mappedQuestionsResult = await pool.query(`
        SELECT 
          q.id as question_id, 
          q.question_text as question, 
          dm.device_type_id,  
          q.order as order_num, 
          q.active,
          a.id as option_id,
          a.text as option_text,
          a.answer_text,
          a.value
        FROM product_question_mappings pqm
        JOIN questions q ON pqm.question_id = q.id
        JOIN products p ON pqm.product_id = p.id
        JOIN device_models dm ON p.device_model_id = dm.id
        LEFT JOIN answer_choices a ON q.id = a.question_id
        WHERE pqm.product_id = $1
        ORDER BY q.order, a.order
      `, [samsungProductId]);
      
      if (mappedQuestionsResult.rows.length > 0) {
        console.log(`Found ${mappedQuestionsResult.rows.length} question records for Samsung Galaxy S21`);
        
        // Format questions and answer choices
        const questionsMap = new Map();
        
        for (const row of mappedQuestionsResult.rows) {
          if (!questionsMap.has(row.question_id)) {
            questionsMap.set(row.question_id, {
              id: row.question_id,
              question: row.question,
              deviceTypeId: row.device_type_id,
              order: row.order_num || 0,
              active: row.active,
              options: []
            });
          }
          
          if (row.option_id) {
            const question = questionsMap.get(row.question_id);
            question.options.push({
              id: row.option_id,
              text: row.option_text,
              answer: row.answer_text,
              value: row.value
            });
          }
        }
        
        questionsData = Array.from(questionsMap.values());
        console.log(`Returning ${questionsData.length} formatted questions for Samsung Galaxy S21`);
      } else {
        console.log('No mapped questions found for Samsung Galaxy S21');
      }
      
      return res.json(questionsData);
    }
    
    // Standard handling for other device models
    console.log(`Fetching questions for standard device model ID: ${modelId}`);
    
    // Get the model name for reference only
    const modelResult = await pool.query(
      `SELECT name FROM device_models WHERE id = $1`,
      [modelId]
    );
    
    const deviceModelName = modelResult.rows.length > 0 ? modelResult.rows[0].name : 'Unknown model';
    console.log(`Processing questions for model: ${deviceModelName}`);
    
    // Since products have been removed, we'll fetch questions directly based on the device model
    // Using the model ID as our reference point
    
    // Get the mapped questions for this product
    try {
      const mappedQuestionsResult = await pool.query(`
        SELECT 
          q.id as question_id, 
          q.question_text as question, 
          dm.device_type_id,  
          q.order as order_num, 
          q.active,
          a.id as option_id,
          a.text as option_text,
          a.answer_text,
          a.value
        FROM product_question_mappings pqm
        JOIN questions q ON pqm.question_id = q.id
        JOIN products p ON pqm.product_id = p.id
        JOIN device_models dm ON p.device_model_id = dm.id
        LEFT JOIN answer_choices a ON q.id = a.question_id
        WHERE pqm.product_id = $1
        ORDER BY q.order, a.order
      `, [productId]);
      
      if (mappedQuestionsResult.rows.length > 0) {
        console.log(`Found ${mappedQuestionsResult.rows.length} question records for product ID: ${productId}`);
        
        // Format questions and answer choices
        const questionsMap = new Map();
        
        for (const row of mappedQuestionsResult.rows) {
          if (!questionsMap.has(row.question_id)) {
            questionsMap.set(row.question_id, {
              id: row.question_id,
              question: row.question,
              deviceTypeId: row.device_type_id,
              order: row.order_num || 0,
              active: row.active,
              options: []
            });
          }
          
          if (row.option_id) {
            const question = questionsMap.get(row.question_id);
            question.options.push({
              id: row.option_id,
              text: row.option_text,
              answer: row.answer_text,
              value: row.value
            });
          }
        }
        
        questionsData = Array.from(questionsMap.values());
        console.log(`Returning ${questionsData.length} formatted questions`);
      } else {
        console.log(`No mapped questions found for product ID: ${productId}`);
      }
    } catch (error) {
      console.error("Error fetching mapped questions:", error);
    }
    
    return res.json(questionsData);
  } catch (error) {
    console.error("Error fetching condition questions:", error);
    res.status(500).json({ message: "Failed to fetch condition questions" });
  }
}