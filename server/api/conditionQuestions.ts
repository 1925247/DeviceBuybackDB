import { Request, Response } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";

/**
 * Retrieves condition questions for a specific device model
 */
export async function getConditionQuestionsForModel(req: Request, res: Response) {
  try {
    const { modelId } = req.params;
    
    // Check if the model exists
    const modelQuery = `
      SELECT id, name, brand_id FROM device_models WHERE id = $1
    `;
    const modelResult = await db.execute(sql.raw(modelQuery), [modelId]);
    
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
              'text', ac.answer_text,
              'value', ac.id::text,
              'icon', ac.icon,
              'weightage', ac.weightage,
              'repairCost', ac.repair_cost,
              'isDefault', ac.is_default,
              'followUpAction', ac.follow_up_action,
              'order', ac.order
            )
          )
          FROM answer_choices ac
          WHERE ac.question_id = mq.id
          ORDER BY ac.order, ac.id
        ) as options
      FROM model_questions mq
    `;
    
    const result = await db.execute(sql.raw(query), [modelId]);
    
    // Group questions by group_id for better frontend organization
    const groupedQuestions = {};
    
    result.rows.forEach(question => {
      if (!groupedQuestions[question.group_id]) {
        groupedQuestions[question.group_id] = {
          id: question.group_id,
          name: question.group_name,
          statement: question.group_statement,
          questions: []
        };
      }
      
      groupedQuestions[question.group_id].questions.push({
        id: question.id,
        question: question.question_text,
        questionType: question.question_type,
        order: question.order,
        tooltip: question.tooltip,
        required: question.required,
        options: question.options || []
      });
    });
    
    // Return the grouped questions
    res.json(Object.values(groupedQuestions));
  } catch (error) {
    console.error("Error fetching condition questions for model:", error);
    res.status(500).json({ message: "Failed to fetch condition questions" });
  }
}

/**
 * Create device question mappings table if it doesn't exist
 */
export async function ensureDeviceQuestionMappingsTable(req: Request, res: Response) {
  try {
    // First check if the table exists
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'device_question_mappings'
      );
    `;
    
    const result = await db.execute(sql.raw(checkTableQuery));
    
    if (!result.rows[0].exists) {
      // Create the table
      const createTableQuery = `
        CREATE TABLE device_question_mappings (
          id SERIAL PRIMARY KEY,
          model_id INTEGER REFERENCES device_models(id) ON DELETE CASCADE,
          question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
          active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(model_id, question_id)
        );
        
        CREATE INDEX idx_device_question_mappings_model ON device_question_mappings(model_id);
        CREATE INDEX idx_device_question_mappings_question ON device_question_mappings(question_id);
      `;
      
      await db.execute(sql.raw(createTableQuery));
      
      return res.json({
        message: "Device question mappings table created successfully"
      });
    }
    
    return res.json({
      message: "Device question mappings table already exists"
    });
  } catch (error) {
    console.error("Error ensuring device question mappings table:", error);
    res.status(500).json({ message: "Database operation failed" });
  }
}

/**
 * Fix device question mappings by ensuring each device model has mappings
 */
export async function fixDeviceQuestionMappings(req: Request, res: Response) {
  try {
    // First ensure the table exists
    await ensureDeviceQuestionMappingsTable(req, res);
    
    // Get all device models
    const modelsQuery = `
      SELECT id, name, brand_id, device_type_id
      FROM device_models
      ORDER BY name
    `;
    
    const modelsResult = await db.execute(sql.raw(modelsQuery));
    const models = modelsResult.rows;
    
    // Get all question groups
    const groupsQuery = `
      SELECT id, name, device_type_id
      FROM question_groups
      WHERE active = true
      ORDER BY name
    `;
    
    const groupsResult = await db.execute(sql.raw(groupsQuery));
    const groups = groupsResult.rows;
    
    // For each model, ensure it has mappings to appropriate question groups
    const results = [];
    
    for (const model of models) {
      // Find groups that match this model's device type
      const matchingGroups = groups.filter(group => 
        group.device_type_id === model.device_type_id || group.device_type_id === null
      );
      
      if (matchingGroups.length === 0) {
        results.push({
          model: model.name,
          message: "No matching question groups found",
          status: "skipped"
        });
        continue;
      }
      
      // For each matching group, map all questions to this model
      for (const group of matchingGroups) {
        // Get questions in this group
        const questionsQuery = `
          SELECT id FROM questions 
          WHERE group_id = $1 AND active = true
        `;
        
        const questionsResult = await db.execute(sql.raw(questionsQuery), [group.id]);
        const questions = questionsResult.rows;
        
        if (questions.length === 0) {
          results.push({
            model: model.name,
            group: group.name,
            message: "No active questions in group",
            status: "skipped"
          });
          continue;
        }
        
        // Create mappings for each question
        for (const question of questions) {
          const mappingQuery = `
            INSERT INTO device_question_mappings 
            (model_id, question_id, active, created_at, updated_at)
            VALUES ($1, $2, true, NOW(), NOW())
            ON CONFLICT (model_id, question_id) 
            DO NOTHING
          `;
          
          await db.execute(sql.raw(mappingQuery), [model.id, question.id]);
        }
        
        results.push({
          model: model.name,
          group: group.name,
          questions: questions.length,
          message: "Mappings created/verified",
          status: "success"
        });
      }
    }
    
    res.json({
      message: "Device question mappings fixed successfully",
      results
    });
  } catch (error) {
    console.error("Error fixing device question mappings:", error);
    res.status(500).json({ message: "Failed to fix device question mappings" });
  }
}