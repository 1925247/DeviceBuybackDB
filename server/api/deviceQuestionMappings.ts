import { Request, Response } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { z } from "zod";
import * as schema from "@shared/schema";

// Get all device-question mappings
export async function getDeviceQuestionMappings(req: Request, res: Response) {
  try {
    const query = `
      SELECT 
        pqm.id,
        dm.id as model_id,
        dm.name as model_name,
        b.name as brand_name,
        dt.name as device_type_name,
        q.id as question_id,
        q.question_text,
        q.question_type,
        qg.id as question_group_id,
        qg.name as group_name,
        pqm.active
      FROM device_question_mappings pqm
      JOIN device_models dm ON pqm.model_id = dm.id
      JOIN brands b ON dm.brand_id = b.id
      JOIN device_types dt ON dm.device_type_id = dt.id
      JOIN questions q ON pqm.question_id = q.id
      LEFT JOIN question_groups qg ON q.group_id = qg.id
      ORDER BY dm.name, q.question_text
    `;

    const result = await db.execute(sql.raw(query));
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching device-question mappings:", error);
    res.status(500).json({ message: "Failed to fetch device-question mappings" });
  }
}

// Get all device models with their question mappings
export async function getDeviceModelsWithQuestionMappings(req: Request, res: Response) {
  try {
    // First get all device models
    const modelsQuery = `
      SELECT 
        dm.id, 
        dm.name, 
        b.name as brand_name,
        dt.name as device_type_name,
        (
          SELECT COUNT(*) 
          FROM device_question_mappings pqm 
          WHERE pqm.model_id = dm.id
        ) as question_count
      FROM device_models dm
      JOIN brands b ON dm.brand_id = b.id
      JOIN device_types dt ON dm.device_type_id = dt.id
      ORDER BY b.name, dm.name
    `;

    const modelsResult = await db.execute(sql.raw(modelsQuery));
    res.json(modelsResult.rows);
  } catch (error) {
    console.error("Error fetching models with question mappings:", error);
    res.status(500).json({ message: "Failed to fetch models with question mappings" });
  }
}

// Get all question groups with their questions
export async function getQuestionGroupsWithQuestions(req: Request, res: Response) {
  try {
    // First get all question groups
    const groupsQuery = `
      SELECT 
        qg.id, 
        qg.name,
        qg.statement,
        qg.device_type_id,
        dt.name as device_type_name,
        (
          SELECT COUNT(*) 
          FROM questions q 
          WHERE q.group_id = qg.id
        ) as question_count
      FROM question_groups qg
      LEFT JOIN device_types dt ON qg.device_type_id = dt.id
      ORDER BY qg.name
    `;

    const groupsResult = await db.execute(sql.raw(groupsQuery));
    
    // Then get the questions for each group
    const groups = await Promise.all(groupsResult.rows.map(async (group) => {
      const questionsQuery = `
        SELECT 
          q.id, 
          q.question_text,
          q.question_type,
          q.order,
          (
            SELECT COUNT(*) 
            FROM device_question_mappings pqm 
            WHERE pqm.question_id = q.id
          ) as mapping_count
        FROM questions q
        WHERE q.group_id = $1
        ORDER BY q.order
      `;
      
      const questionsResult = await db.execute(sql.raw(questionsQuery), [group.id]);
      
      return {
        ...group,
        questions: questionsResult.rows
      };
    }));
    
    res.json(groups);
  } catch (error) {
    console.error("Error fetching question groups with questions:", error);
    res.status(500).json({ message: "Failed to fetch question groups with questions" });
  }
}

// Get mappings for a specific model
export async function getDeviceQuestionMappingsByModel(req: Request, res: Response) {
  try {
    const { modelId } = req.params;
    
    const query = `
      SELECT 
        pqm.id,
        pqm.model_id,
        pqm.question_id,
        pqm.active,
        q.question_text,
        q.question_type,
        qg.id as group_id,
        qg.name as group_name
      FROM device_question_mappings pqm
      JOIN questions q ON pqm.question_id = q.id
      LEFT JOIN question_groups qg ON q.group_id = qg.id
      WHERE pqm.model_id = $1
      ORDER BY qg.name, q.order
    `;

    const result = await db.execute(sql.raw(query), [modelId]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching device question mappings:", error);
    res.status(500).json({ message: "Failed to fetch device question mappings" });
  }
}

// Map a question group to a model
export async function mapQuestionGroupToModel(req: Request, res: Response) {
  try {
    const schema = z.object({
      modelId: z.number(),
      groupId: z.number()
    });

    const data = schema.parse(req.body);
    
    // Begin a transaction
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      
      // Get all questions in the group
      const questionsQuery = `
        SELECT id FROM questions WHERE group_id = $1
      `;
      const questionsResult = await client.query(questionsQuery, [data.groupId]);
      const questions = questionsResult.rows;
      
      if (questions.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: "No questions found in this group" });
      }
      
      // Check if the device_question_mappings table exists, if not create it
      const checkTableQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'device_question_mappings'
        );
      `;
      const tableCheckResult = await client.query(checkTableQuery);
      
      if (!tableCheckResult.rows[0].exists) {
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
        `;
        await client.query(createTableQuery);
      }
      
      // Insert mappings for each question
      for (const question of questions) {
        const insertQuery = `
          INSERT INTO device_question_mappings 
          (model_id, question_id, active, created_at, updated_at)
          VALUES ($1, $2, TRUE, NOW(), NOW())
          ON CONFLICT (model_id, question_id) 
          DO UPDATE SET 
            active = TRUE,
            updated_at = NOW()
        `;
        await client.query(insertQuery, [data.modelId, question.id]);
      }
      
      await client.query('COMMIT');
      res.status(201).json({ message: "Question group mapped to model successfully" });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error mapping question group to model:", error);
    res.status(500).json({ message: "Failed to map question group to model" });
  }
}

// Map multiple question groups to a model
export async function mapMultipleGroupsToModel(req: Request, res: Response) {
  try {
    const schema = z.object({
      modelId: z.number(),
      groupIds: z.array(z.number())
    });

    const data = schema.parse(req.body);
    
    // Begin a transaction
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      
      // Check if the device_question_mappings table exists, if not create it
      const checkTableQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'device_question_mappings'
        );
      `;
      const tableCheckResult = await client.query(checkTableQuery);
      
      if (!tableCheckResult.rows[0].exists) {
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
        `;
        await client.query(createTableQuery);
      }
      
      for (const groupId of data.groupIds) {
        // Get all questions in the group
        const questionsQuery = `
          SELECT id FROM questions WHERE group_id = $1
        `;
        const questionsResult = await client.query(questionsQuery, [groupId]);
        const questions = questionsResult.rows;
        
        // Insert mappings for each question
        for (const question of questions) {
          const insertQuery = `
            INSERT INTO device_question_mappings 
            (model_id, question_id, active, created_at, updated_at)
            VALUES ($1, $2, TRUE, NOW(), NOW())
            ON CONFLICT (model_id, question_id) 
            DO UPDATE SET 
              active = TRUE,
              updated_at = NOW()
          `;
          await client.query(insertQuery, [data.modelId, question.id]);
        }
      }
      
      await client.query('COMMIT');
      res.status(201).json({ message: "Question groups mapped to model successfully" });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error mapping question groups to model:", error);
    res.status(500).json({ message: "Failed to map question groups to model" });
  }
}

// Remove a question mapping from a model
export async function removeQuestionMappingFromModel(req: Request, res: Response) {
  try {
    const { mappingId } = req.params;
    
    const query = `
      DELETE FROM device_question_mappings
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await db.execute(sql.raw(query), [mappingId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Mapping not found" });
    }
    
    res.json({ message: "Mapping removed successfully" });
  } catch (error) {
    console.error("Error removing question mapping:", error);
    res.status(500).json({ message: "Failed to remove question mapping" });
  }
}

// Remove all question mappings for a group from a model
export async function removeGroupMappingsFromModel(req: Request, res: Response) {
  try {
    const { modelId, groupId } = req.params;
    
    const query = `
      DELETE FROM device_question_mappings
      WHERE model_id = $1 AND question_id IN (
        SELECT id FROM questions WHERE group_id = $2
      )
      RETURNING *
    `;
    
    const result = await db.execute(sql.raw(query), [modelId, groupId]);
    
    res.json({ 
      message: "Group mappings removed successfully",
      count: result.rows.length
    });
  } catch (error) {
    console.error("Error removing group mappings:", error);
    res.status(500).json({ message: "Failed to remove group mappings" });
  }
}

// Get condition questions for a device model
export async function getConditionQuestionsForDeviceModel(req: Request, res: Response) {
  try {
    const { modelId } = req.params;
    
    const query = `
      WITH model_questions AS (
        SELECT 
          q.id,
          q.question_text,
          q.question_type,
          q.order,
          q.tooltip,
          q.required,
          pqm.active,
          qg.id as group_id,
          qg.name as group_name,
          qg.statement as group_statement
        FROM device_question_mappings pqm
        JOIN questions q ON pqm.question_id = q.id
        JOIN question_groups qg ON q.group_id = qg.id
        WHERE pqm.model_id = $1 AND pqm.active = TRUE AND q.active = TRUE
        ORDER BY qg.id, q.order
      )
      SELECT 
        mq.*,
        (
          SELECT json_agg(
            json_build_object(
              'id', ac.id,
              'answerText', ac.answer_text,
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
          ORDER BY ac.order
        ) as answer_choices
      FROM model_questions mq
    `;
    
    const result = await db.execute(sql.raw(query), [modelId]);
    
    // Group questions by group_id for better frontend organization
    const groupedQuestions: { [key: string]: any } = {};
    
    result.rows.forEach((question: any) => {
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
        active: question.active,
        options: question.answer_choices || []
      });
    });
    
    res.json(Object.values(groupedQuestions));
  } catch (error) {
    console.error("Error fetching condition questions for device model:", error);
    res.status(500).json({ message: "Failed to fetch condition questions" });
  }
}