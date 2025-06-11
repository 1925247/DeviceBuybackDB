import { db, pool } from "../db.js";
import { sql } from "drizzle-orm";

/**
 * Retrieves condition questions for a specific device model
 */
export async function getConditionQuestionsForModel(req, res) {
  try {
    const { modelId } = req.params;
    
    // Check if the model exists
    const modelQuery = `
      SELECT id, name, brand_id FROM device_models WHERE id = $1
    `;
    const modelResult = await pool.query(modelQuery, [modelId]);
    
    if (modelResult.rows.length === 0) {
      return res.status(404).json({ message: "Device model not found" });
    }
    
    // Fetch all questions mapped to this model
    const query = `
      WITH model_questions AS (
        SELECT 
          q.id,
          q.question_text,
          q.question_type,
          q.order,
          q.tooltip,
          q.required,
          qg.id as group_id,
          qg.name as group_name,
          qg.statement as group_statement
        FROM questions q
        JOIN question_groups qg ON q.group_id = qg.id
        WHERE q.active = true
        AND EXISTS (
          SELECT 1 FROM device_question_mappings m 
          WHERE m.question_id = q.id 
          AND m.model_id = $1 
          AND m.active = true
        )
        ORDER BY qg.id, q.order
      )
      SELECT 
        mq.*,
        (
          SELECT json_agg(
            json_build_object(
              'id', ac.id,
              'answerText', ac.answer_text,
              'icon', ac.icon,
              'weightage', ac.weightage,
              'repairCost', ac.repair_cost,
              'isDefault', ac.is_default,
              'order', ac.order
            ) ORDER BY ac.order
          )
          FROM answer_choices ac 
          WHERE ac.question_id = mq.id
        ) as answers
      FROM model_questions mq
    `;
    
    const result = await pool.query(query, [modelId]);
    
    // Group questions by group
    const groupedQuestions = result.rows.reduce((acc, question) => {
      const groupId = question.group_id;
      if (!acc[groupId]) {
        acc[groupId] = {
          id: groupId,
          name: question.group_name,
          statement: question.group_statement,
          questions: []
        };
      }
      
      acc[groupId].questions.push({
        id: question.id,
        questionText: question.question_text,
        questionType: question.question_type,
        order: question.order,
        tooltip: question.tooltip,
        required: question.required,
        answers: question.answers || []
      });
      
      return acc;
    }, {});
    
    res.json({
      modelId: parseInt(modelId),
      model: modelResult.rows[0],
      questionGroups: Object.values(groupedQuestions)
    });
    
  } catch (error) {
    console.error("Error fetching condition questions for model:", error);
    res.status(500).json({ 
      error: "Failed to fetch condition questions", 
      details: error.message 
    });
  }
}

/**
 * Ensures the device_question_mappings table exists
 */
export async function ensureDeviceQuestionMappingsTable(req, res) {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS device_question_mappings (
        id SERIAL PRIMARY KEY,
        model_id INTEGER NOT NULL REFERENCES device_models(id) ON DELETE CASCADE,
        question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(model_id, question_id)
      );
    `;
    
    await pool.query(createTableQuery);
    
    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_device_question_mappings_model 
      ON device_question_mappings(model_id);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_device_question_mappings_question 
      ON device_question_mappings(question_id);
    `);
    
    res.json({ 
      success: true, 
      message: "Device question mappings table ensured" 
    });
    
  } catch (error) {
    console.error("Error ensuring device question mappings table:", error);
    res.status(500).json({ 
      error: "Failed to ensure table", 
      details: error.message 
    });
  }
}

/**
 * Fixes device question mappings by creating sample mappings
 */
export async function fixDeviceQuestionMappings(req, res) {
  try {
    // Get sample device models and questions for mapping
    const sampleMappings = await pool.query(`
      WITH device_model_sample AS (
        SELECT dm.id as model_id, dt.id as device_type_id
        FROM device_models dm
        JOIN device_types dt ON dm.device_type_id = dt.id
        WHERE dm.active = true
        LIMIT 10
      ),
      question_sample AS (
        SELECT q.id as question_id, qg.device_type_id
        FROM questions q
        LEFT JOIN question_groups qg ON q.group_id = qg.id
        WHERE q.active = true
        LIMIT 20
      )
      INSERT INTO device_question_mappings (model_id, question_id, active)
      SELECT dms.model_id, qs.question_id, true
      FROM device_model_sample dms
      CROSS JOIN question_sample qs
      WHERE qs.device_type_id IS NULL OR qs.device_type_id = dms.device_type_id
      ON CONFLICT (model_id, question_id) DO NOTHING
      RETURNING model_id, question_id;
    `);
    
    res.json({ 
      success: true, 
      message: `Created ${sampleMappings.rowCount} question mappings`,
      mappingsCreated: sampleMappings.rowCount
    });
    
  } catch (error) {
    console.error("Error fixing device question mappings:", error);
    res.status(500).json({ 
      error: "Failed to fix mappings", 
      details: error.message 
    });
  }
}