import { db, pool } from "../db.js";

/**
 * Get questions mapped specifically to a device model
 * Only shows questions that admin has mapped to this model
 */
export async function getModelSpecificQuestions(req, res) {
  try {
    const { deviceType, brand, model, modelId } = req.query;
    
    console.log('Model-specific questions request:', { deviceType, brand, model, modelId });
    
    let targetModelId = modelId;
    
    // If modelId not provided, find it using deviceType, brand, model
    if (!targetModelId && deviceType && brand && model) {
      const modelQuery = `
        SELECT dm.id 
        FROM device_models dm
        JOIN brands b ON dm.brand_id = b.id
        JOIN device_types dt ON dm.device_type_id = dt.id
        WHERE dt.name ILIKE $1 AND b.name ILIKE $2 AND dm.slug = $3
        AND dm.active = true
      `;
      const modelResult = await pool.query(modelQuery, [deviceType, brand, model]);
      
      if (modelResult.rows.length > 0) {
        targetModelId = modelResult.rows[0].id;
      }
    }
    
    if (!targetModelId) {
      console.log('No model ID found, returning empty questions');
      return res.json([]);
    }
    
    console.log('Fetching questions for model ID:', targetModelId);
    
    // Get questions mapped to this specific model through flexible question groups system
    const query = `
      WITH model_mapped_questions AS (
        -- Get questions from groups mapped to this model
        SELECT DISTINCT
          q.id,
          q.question_text,
          q.question_type,
          q.sort_order,
          q.tooltip,
          q.help_text,
          q.required,
          qg.id as group_id,
          qg.name as group_name,
          qg.statement as group_statement,
          qg.category,
          qg.color,
          'group_mapping' as mapping_type
        FROM questions q
        JOIN question_groups qg ON q.group_id = qg.id
        JOIN group_model_mappings gmm ON qg.id = gmm.group_id
        WHERE gmm.model_id = $1 
        AND gmm.active = true
        AND q.active = true
        AND qg.active = true
        
        -- Individual question mapping temporarily disabled due to table structure
      )
      SELECT 
        mmq.*,
        (
          SELECT json_agg(
            json_build_object(
              'id', ac.id,
              'text', ac.text,
              'value', ac.value,
              'impact', COALESCE(amm.deduction_rate, ac.percentage_impact, 0),
              'description', ac.description,
              'severity', ac.severity,
              'sort_order', ac.sort_order
            ) ORDER BY ac.sort_order
          )
          FROM answer_choices ac 
          LEFT JOIN answer_model_mappings amm ON ac.id = amm.answer_id AND amm.model_id = $1
          WHERE ac.question_id = mmq.id
        ) as options
      FROM model_mapped_questions mmq
      ORDER BY mmq.group_id, mmq.sort_order
    `;
    
    const result = await pool.query(query, [targetModelId]);
    
    if (result.rows.length === 0) {
      console.log('No mapped questions found for model ID:', targetModelId);
      return res.json([]);
    }
    
    // Transform to frontend format
    const questions = result.rows.map(row => ({
      id: row.id,
      question: row.question_text,
      type: row.question_type || 'multiple_choice',
      required: row.required || true,
      category: row.category,
      group: row.group_name,
      tooltip: row.tooltip,
      help_text: row.help_text,
      options: row.options || []
    }));
    
    console.log(`Returning ${questions.length} mapped questions for model ID ${targetModelId}`);
    res.json(questions);
    
  } catch (error) {
    console.error('Error getting model-specific questions:', error);
    res.status(500).json({ 
      error: 'Failed to get model-specific questions',
      details: error.message 
    });
  }
}

/**
 * Create sample mappings for demonstration
 */
export async function createSampleModelMappings(req, res) {
  try {
    const { modelId } = req.body;
    
    if (!modelId) {
      return res.status(400).json({ error: 'Model ID is required' });
    }
    
    // Map some sample question groups to the model
    const groupMappings = await pool.query(`
      INSERT INTO group_model_mappings (group_id, model_id, active, deduction_rate)
      SELECT qg.id, $1, true, 1.0
      FROM question_groups qg
      WHERE qg.name IN ('Body & Physical Condition', 'Screen & Display Assessment')
      AND qg.active = true
      ON CONFLICT (group_id, model_id) DO UPDATE SET active = true
      RETURNING group_id, model_id
    `, [modelId]);
    
    // Also create some individual question mappings
    const questionMappings = await pool.query(`
      INSERT INTO question_model_mappings (question_id, model_id, active, deduction_rate)
      SELECT q.id, $1, true, 1.0
      FROM questions q
      JOIN question_groups qg ON q.group_id = qg.id
      WHERE qg.name = 'Functional Issues Check'
      AND q.active = true
      LIMIT 2
      ON CONFLICT (question_id, model_id) DO UPDATE SET active = true
      RETURNING question_id, model_id
    `, [modelId]);
    
    res.json({
      success: true,
      message: 'Sample mappings created',
      groupMappings: groupMappings.rowCount,
      questionMappings: questionMappings.rowCount
    });
    
  } catch (error) {
    console.error('Error creating sample mappings:', error);
    res.status(500).json({ 
      error: 'Failed to create sample mappings',
      details: error.message 
    });
  }
}