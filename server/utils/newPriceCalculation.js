/**
 * New Cashify-style Price Calculation System
 * Flow: Base Price - Group Deductions = Final Price
 */

import { pool } from "../db.js";

/**
 * Calculate final price using Cashify-style group-based deductions
 * @param {Object} params - Calculation parameters
 * @param {number} params.modelId - Device model ID
 * @param {string} params.variantSlug - Device variant slug (optional)
 * @param {Object} params.answers - Customer answers {questionId: answerId}
 * @returns {Object} Price calculation result
 */
export async function calculateFinalPrice(params) {
  const { modelId, variantSlug, answers } = params;
  
  console.log('New calculation system - Input:', { modelId, variantSlug, answers });
  
  try {
    // Step 1: Get base price from model/variant
    const basePrice = await getBasePrice(modelId, variantSlug);
    console.log('Base price fetched:', basePrice);
    
    // Step 2: Calculate group-based deductions
    const deductions = await calculateGroupDeductions(modelId, answers);
    console.log('Group deductions calculated:', deductions);
    
    // Step 3: Calculate final price
    const totalDeduction = deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
    const finalPrice = Math.max(0, basePrice - totalDeduction);
    
    const result = {
      basePrice,
      deductions,
      totalDeduction,
      finalPrice,
      currency: 'INR',
      calculation: 'group_based'
    };
    
    console.log('Final calculation result:', result);
    return result;
    
  } catch (error) {
    console.error('Price calculation error:', error);
    throw new Error(`Price calculation failed: ${error.message}`);
  }
}

/**
 * Get base price for model/variant
 */
async function getBasePrice(modelId, variantSlug) {
  try {
    // Try to get variant-specific price first
    if (variantSlug) {
      const variantQuery = `
        SELECT dmv.base_price
        FROM device_model_variants dmv
        WHERE dmv.model_id = $1 AND dmv.slug = $2 AND dmv.active = true
      `;
      const variantResult = await pool.query(variantQuery, [modelId, variantSlug]);
      
      if (variantResult.rows.length > 0 && variantResult.rows[0].base_price) {
        return parseFloat(variantResult.rows[0].base_price);
      }
    }
    
    // Fallback to model base price
    const modelQuery = `
      SELECT dm.base_price
      FROM device_models dm
      WHERE dm.id = $1 AND dm.active = true
    `;
    const modelResult = await pool.query(modelQuery, [modelId]);
    
    if (modelResult.rows.length > 0 && modelResult.rows[0].base_price) {
      return parseFloat(modelResult.rows[0].base_price);
    }
    
    // Final fallback to default price
    console.log('No base price found, using default');
    return 25000; // Default base price in INR
    
  } catch (error) {
    console.error('Error fetching base price:', error);
    return 25000; // Fallback price
  }
}

/**
 * Calculate deductions from all mapped groups
 */
async function calculateGroupDeductions(modelId, answers) {
  const deductions = [];
  
  try {
    // Get all answer choices with their deduction rates for the given answers
    const answersArray = Object.entries(answers).map(([questionId, answerId]) => ({
      questionId: parseInt(questionId),
      answerId: parseInt(answerId)
    }));
    
    if (answersArray.length === 0) {
      return deductions;
    }
    
    const questionIds = answersArray.map(a => a.questionId);
    const answerIds = answersArray.map(a => a.answerId);
    
    const deductionQuery = `
      SELECT 
        qg.name as group_name,
        qg.category as group_category,
        q.id as question_id,
        q.question_text,
        ac.id as answer_id,
        ac.text as answer_text,
        ac.percentage_impact,
        gmm.model_id
      FROM questions q
      JOIN question_groups qg ON q.group_id = qg.id
      JOIN group_model_mappings gmm ON qg.id = gmm.group_id
      JOIN answer_choices ac ON q.id = ac.question_id
      WHERE gmm.model_id = $1
        AND gmm.active = true
        AND q.active = true
        AND qg.active = true
        AND q.id = ANY($2)
        AND ac.id = ANY($3)
      ORDER BY qg.sort_order, q.sort_order
    `;
    
    const result = await pool.query(deductionQuery, [modelId, questionIds, answerIds]);
    
    // Process each answer and calculate deduction
    for (const row of result.rows) {
      const userAnswer = answersArray.find(a => 
        a.questionId === row.question_id && a.answerId === row.answer_id
      );
      
      if (userAnswer) {
        const deductionRate = parseFloat(row.percentage_impact) || 0;
        
        // For now, calculate as percentage of base price
        // Later can be enhanced for fixed amounts vs percentages
        const basePrice = await getBasePrice(modelId);
        const deductionAmount = Math.abs((deductionRate / 100) * basePrice);
        
        deductions.push({
          groupName: row.group_name,
          groupCategory: row.group_category,
          questionText: row.question_text,
          answerText: row.answer_text,
          deductionRate: deductionRate,
          amount: deductionAmount,
          type: 'percentage'
        });
      }
    }
    
    return deductions;
    
  } catch (error) {
    console.error('Error calculating group deductions:', error);
    return deductions;
  }
}

/**
 * Get price breakdown for a specific model
 */
export async function getPriceBreakdown(modelId, variantSlug = null) {
  try {
    const basePrice = await getBasePrice(modelId, variantSlug);
    
    const modelQuery = `
      SELECT dm.name as model_name, dm.slug as model_slug
      FROM device_models dm
      WHERE dm.id = $1
    `;
    const modelResult = await pool.query(modelQuery, [modelId]);
    const modelInfo = modelResult.rows[0] || {};
    
    // Get mapped groups for this model
    const groupsQuery = `
      SELECT 
        qg.id,
        qg.name,
        qg.category,
        qg.question_level,
        COUNT(q.id) as question_count
      FROM question_groups qg
      JOIN group_model_mappings gmm ON qg.id = gmm.group_id
      LEFT JOIN questions q ON qg.id = q.group_id AND q.active = true
      WHERE gmm.model_id = $1
        AND gmm.active = true
        AND qg.active = true
      GROUP BY qg.id, qg.name, qg.category, qg.question_level, qg.sort_order
      ORDER BY qg.sort_order
    `;
    const groupsResult = await pool.query(groupsQuery, [modelId]);
    
    return {
      modelInfo,
      basePrice,
      currency: 'INR',
      mappedGroups: groupsResult.rows,
      calculationMethod: 'group_based_deduction'
    };
    
  } catch (error) {
    console.error('Error getting price breakdown:', error);
    throw error;
  }
}

/**
 * Validate if answers match mapped questions for model
 */
export async function validateAnswersForModel(modelId, answers) {
  try {
    const answersArray = Object.entries(answers).map(([questionId, answerId]) => ({
      questionId: parseInt(questionId),
      answerId: parseInt(answerId)
    }));
    
    const questionIds = answersArray.map(a => a.questionId);
    
    // Check if all questions are mapped to this model
    const validationQuery = `
      SELECT COUNT(DISTINCT q.id) as mapped_question_count
      FROM questions q
      JOIN question_groups qg ON q.group_id = qg.id
      JOIN group_model_mappings gmm ON qg.id = gmm.group_id
      WHERE gmm.model_id = $1
        AND gmm.active = true
        AND q.active = true
        AND qg.active = true
        AND q.id = ANY($2)
    `;
    
    const result = await pool.query(validationQuery, [modelId, questionIds]);
    const mappedCount = parseInt(result.rows[0].mapped_question_count);
    
    return {
      valid: mappedCount === questionIds.length,
      providedQuestions: questionIds.length,
      mappedQuestions: mappedCount,
      unmappedQuestions: questionIds.length - mappedCount
    };
    
  } catch (error) {
    console.error('Error validating answers:', error);
    return {
      valid: false,
      error: error.message
    };
  }
}