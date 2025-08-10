/**
 * New Valuation API using Cashify-style calculation
 */

import { calculateFinalPrice, getPriceBreakdown, validateAnswersForModel } from "../utils/newPriceCalculation.js";
import { pool } from "../db.js";

/**
 * Calculate device valuation using new group-based system
 */
export async function calculateDeviceValuation(req, res) {
  try {
    const { modelId, variantSlug, answers, deviceType, brand, model } = req.body;
    
    console.log('New valuation request:', { modelId, variantSlug, answers, deviceType, brand, model });
    
    let targetModelId = modelId;
    
    // Find model ID if not provided
    if (!targetModelId && deviceType && brand && model) {
      const modelQuery = `
        SELECT dm.id, dm.name, dm.slug
        FROM device_models dm
        JOIN brands b ON dm.brand_id = b.id
        JOIN device_types dt ON dm.device_type_id = dt.id
        WHERE dt.name ILIKE $1 AND b.name ILIKE $2 AND dm.slug = $3
        AND dm.active = true
      `;
      const modelResult = await pool.query(modelQuery, [deviceType, brand, model]);
      
      if (modelResult.rows.length > 0) {
        targetModelId = modelResult.rows[0].id;
        console.log('Found model ID:', targetModelId);
      } else {
        return res.status(404).json({
          error: 'Device model not found',
          details: { deviceType, brand, model }
        });
      }
    }
    
    if (!targetModelId) {
      return res.status(400).json({
        error: 'Model ID is required for valuation'
      });
    }
    
    if (!answers || Object.keys(answers).length === 0) {
      return res.status(400).json({
        error: 'Answers are required for valuation'
      });
    }
    
    // Validate answers against model mappings
    const validation = await validateAnswersForModel(targetModelId, answers);
    if (!validation.valid) {
      console.log('Answer validation failed:', validation);
      return res.status(400).json({
        error: 'Invalid answers for selected model',
        validation
      });
    }
    
    // Calculate final price using new system
    const calculation = await calculateFinalPrice({
      modelId: targetModelId,
      variantSlug,
      answers
    });
    
    // Add metadata
    const response = {
      ...calculation,
      modelId: targetModelId,
      variantSlug,
      answersProvided: Object.keys(answers).length,
      calculationTimestamp: new Date().toISOString(),
      systemVersion: 'v2.0-group-based'
    };
    
    console.log('Valuation response:', response);
    res.json(response);
    
  } catch (error) {
    console.error('Valuation calculation error:', error);
    res.status(500).json({
      error: 'Valuation calculation failed',
      details: error.message
    });
  }
}

/**
 * Get model price breakdown
 */
export async function getModelPriceBreakdown(req, res) {
  try {
    const { modelId } = req.params;
    const { variantSlug } = req.query;
    
    const breakdown = await getPriceBreakdown(parseInt(modelId), variantSlug);
    
    res.json(breakdown);
    
  } catch (error) {
    console.error('Price breakdown error:', error);
    res.status(500).json({
      error: 'Failed to get price breakdown',
      details: error.message
    });
  }
}

/**
 * Validate customer answers for a model
 */
export async function validateModelAnswers(req, res) {
  try {
    const { modelId, answers } = req.body;
    
    const validation = await validateAnswersForModel(modelId, answers);
    
    res.json(validation);
    
  } catch (error) {
    console.error('Answer validation error:', error);
    res.status(500).json({
      error: 'Answer validation failed',
      details: error.message
    });
  }
}

/**
 * Get all mapped groups and questions for a model
 */
export async function getModelAssessmentFlow(req, res) {
  try {
    const { modelId } = req.params;
    
    const flowQuery = `
      SELECT 
        qg.id as group_id,
        qg.name as group_name,
        qg.category,
        qg.question_level,
        qg.statement as group_statement,
        qg.sort_order as group_sort_order,
        json_agg(
          json_build_object(
            'id', q.id,
            'question_text', q.question_text,
            'question_type', q.question_type,
            'required', q.required,
            'sort_order', q.sort_order,
            'options', q_options.options
          ) ORDER BY q.sort_order
        ) as questions
      FROM question_groups qg
      JOIN group_model_mappings gmm ON qg.id = gmm.group_id
      JOIN questions q ON qg.id = q.group_id
      LEFT JOIN (
        SELECT 
          ac.question_id,
          json_agg(
            json_build_object(
              'id', ac.id,
              'text', ac.text,
              'value', ac.value,
              'impact', ac.percentage_impact
            ) ORDER BY ac.sort_order
          ) as options
        FROM answer_choices ac
        GROUP BY ac.question_id
      ) q_options ON q.id = q_options.question_id
      WHERE gmm.model_id = $1
        AND gmm.active = true
        AND q.active = true
        AND qg.active = true
      GROUP BY qg.id, qg.name, qg.category, qg.question_level, qg.statement, qg.sort_order
      ORDER BY qg.sort_order
    `;
    
    const result = await pool.query(flowQuery, [modelId]);
    
    res.json({
      modelId: parseInt(modelId),
      assessmentGroups: result.rows,
      totalGroups: result.rows.length,
      systemVersion: 'v2.0-group-based'
    });
    
  } catch (error) {
    console.error('Assessment flow error:', error);
    res.status(500).json({
      error: 'Failed to get assessment flow',
      details: error.message
    });
  }
}