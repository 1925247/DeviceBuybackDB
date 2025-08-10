/**
 * Enhanced Flexible Question Groups API
 * Supports full control over group-to-model mappings with reusable questions
 */

import { pool } from "../db.js";

/**
 * Get all question groups with mapping statistics
 */
export async function getQuestionGroupsWithStats(req, res) {
  try {
    console.log('Fetching question groups with mapping statistics...');
    
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          qg.*,
          COUNT(DISTINCT q.id) as question_count,
          COUNT(DISTINCT gmm.model_id) as mapped_model_count,
          COUNT(DISTINCT bmm.brand_id) as mapped_brand_count,
          COALESCE(AVG(gmm.sort_order), 0) as avg_sort_order
        FROM question_groups qg
        LEFT JOIN questions q ON qg.id = q.group_id AND q.active = true
        LEFT JOIN group_model_mappings gmm ON qg.id = gmm.group_id AND gmm.active = true
        LEFT JOIN brand_group_mappings bmm ON qg.id = bmm.group_id AND bmm.active = true
        WHERE qg.active = true
        GROUP BY qg.id
        ORDER BY qg.sort_order ASC, qg.name ASC
      `;
      
      const result = await client.query(query);
      
      console.log(`Found ${result.rows.length} question groups with stats`);
      res.json(result.rows);
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching question groups with stats:', error);
    res.status(500).json({ error: 'Failed to fetch question groups' });
  }
}

/**
 * Create a new question group with full configuration
 */
export async function createQuestionGroup(req, res) {
  try {
    const {
      name,
      statement,
      description,
      category = 'general',
      deviceTypes = [],
      icon,
      color = '#3B82F6',
      sortOrder = 0,
      active = true,
      isReusable = true
    } = req.body;

    console.log('Creating new question group:', { name, category });

    const client = await pool.connect();
    try {
      const query = `
        INSERT INTO question_groups (
          name, statement, description, category, device_types, 
          icon, color, sort_order, active, is_reusable
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      
      const values = [
        name, statement, description, category, JSON.stringify(deviceTypes),
        icon, color, sortOrder, active, isReusable
      ];
      
      const result = await client.query(query, values);
      
      console.log('Question group created:', result.rows[0]);
      res.status(201).json(result.rows[0]);
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating question group:', error);
    res.status(500).json({ error: 'Failed to create question group' });
  }
}

/**
 * Map a question group to specific device models
 */
export async function mapGroupToModels(req, res) {
  try {
    const { groupId } = req.params;
    const { 
      modelIds, 
      sortOrder = 0, 
      customSettings = {},
      groupName = null,
      groupStatement = null 
    } = req.body;

    console.log(`Mapping group ${groupId} to models:`, modelIds);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // First, remove existing mappings if replacing
      if (req.body.replaceExisting) {
        await client.query(
          'DELETE FROM group_model_mappings WHERE group_id = $1',
          [groupId]
        );
      }
      
      // Insert new mappings
      const mappings = [];
      for (const modelId of modelIds) {
        const query = `
          INSERT INTO group_model_mappings (
            group_id, model_id, sort_order, group_name, group_statement, custom_settings
          ) VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (group_id, model_id) 
          DO UPDATE SET 
            sort_order = $3,
            group_name = $4,
            group_statement = $5,
            custom_settings = $6,
            active = true,
            updated_at = NOW()
          RETURNING *
        `;
        
        const values = [
          groupId, modelId, sortOrder, groupName, groupStatement, 
          JSON.stringify(customSettings)
        ];
        
        const result = await client.query(query, values);
        mappings.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      
      console.log(`Created ${mappings.length} group-to-model mappings`);
      res.json({ 
        message: 'Group mapped to models successfully',
        mappings: mappings
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error mapping group to models:', error);
    res.status(500).json({ error: 'Failed to map group to models' });
  }
}

/**
 * Map specific questions to models (granular control)
 */
export async function mapQuestionToModels(req, res) {
  try {
    const { questionId } = req.params;
    const { 
      modelIds, 
      sortOrder = 0,
      required = null,
      questionText = null,
      helpText = null,
      customSettings = {}
    } = req.body;

    console.log(`Mapping question ${questionId} to models:`, modelIds);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Remove existing mappings if replacing
      if (req.body.replaceExisting) {
        await client.query(
          'DELETE FROM question_model_mappings WHERE question_id = $1',
          [questionId]
        );
      }
      
      // Insert new mappings
      const mappings = [];
      for (const modelId of modelIds) {
        const query = `
          INSERT INTO question_model_mappings (
            question_id, model_id, sort_order, required, question_text, help_text, custom_settings
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (question_id, model_id)
          DO UPDATE SET 
            sort_order = $3,
            required = $4,
            question_text = $5,
            help_text = $6,
            custom_settings = $7,
            active = true,
            updated_at = NOW()
          RETURNING *
        `;
        
        const values = [
          questionId, modelId, sortOrder, required, questionText, helpText,
          JSON.stringify(customSettings)
        ];
        
        const result = await client.query(query, values);
        mappings.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      
      console.log(`Created ${mappings.length} question-to-model mappings`);
      res.json({ 
        message: 'Question mapped to models successfully',
        mappings: mappings
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error mapping question to models:', error);
    res.status(500).json({ error: 'Failed to map question to models' });
  }
}

/**
 * Set model-specific deduction rates for answer choices
 */
export async function setAnswerModelRates(req, res) {
  try {
    const { answerId } = req.params;
    const { 
      modelRates, // [{ modelId, weightage, repairCost, answerText, description, severity }]
      replaceExisting = false
    } = req.body;

    console.log(`Setting model-specific rates for answer ${answerId}`);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Remove existing mappings if replacing
      if (replaceExisting) {
        await client.query(
          'DELETE FROM answer_model_mappings WHERE answer_id = $1',
          [answerId]
        );
      }
      
      // Insert new model-specific rates
      const mappings = [];
      for (const rate of modelRates) {
        const query = `
          INSERT INTO answer_model_mappings (
            answer_id, model_id, weightage, repair_cost, answer_text, 
            description, severity, custom_settings
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (answer_id, model_id)
          DO UPDATE SET 
            weightage = $3,
            repair_cost = $4,
            answer_text = $5,
            description = $6,
            severity = $7,
            custom_settings = $8,
            is_active = true,
            updated_at = NOW()
          RETURNING *
        `;
        
        const values = [
          answerId, rate.modelId, rate.weightage, rate.repairCost,
          rate.answerText, rate.description, rate.severity,
          JSON.stringify(rate.customSettings || {})
        ];
        
        const result = await client.query(query, values);
        mappings.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      
      console.log(`Set model-specific rates for ${mappings.length} models`);
      res.json({ 
        message: 'Model-specific rates set successfully',
        mappings: mappings
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error setting answer model rates:', error);
    res.status(500).json({ error: 'Failed to set model-specific rates' });
  }
}

/**
 * Get questions for a specific device model (with all mappings resolved)
 */
export async function getQuestionsForModel(req, res) {
  try {
    const { modelId } = req.params;
    const { includeInactive = false } = req.query;

    console.log(`Fetching questions for model ${modelId}`);

    const client = await pool.connect();
    try {
      // Get model details
      const modelQuery = `
        SELECT dm.*, b.name as brand_name, dt.name as device_type_name
        FROM device_models dm
        JOIN brands b ON dm.brand_id = b.id
        JOIN device_types dt ON dm.device_type_id = dt.id
        WHERE dm.id = $1
      `;
      
      const modelResult = await client.query(modelQuery, [modelId]);
      
      if (modelResult.rows.length === 0) {
        return res.status(404).json({ error: 'Model not found' });
      }
      
      const model = modelResult.rows[0];
      
      // Get question groups mapped to this model (via group_model_mappings)
      const groupQuery = `
        SELECT 
          qg.*,
          gmm.sort_order as mapping_sort_order,
          gmm.group_name as override_name,
          gmm.group_statement as override_statement,
          gmm.custom_settings as group_custom_settings
        FROM question_groups qg
        JOIN group_model_mappings gmm ON qg.id = gmm.group_id
        WHERE gmm.model_id = $1 AND gmm.active = true AND qg.active = true
        ORDER BY gmm.sort_order ASC, qg.sort_order ASC
      `;
      
      const groupsResult = await client.query(groupQuery, [modelId]);
      
      // Get questions for each group
      const groupsWithQuestions = [];
      
      for (const group of groupsResult.rows) {
        // Get questions in this group
        const questionQuery = `
          SELECT 
            q.*,
            COALESCE(qmm.sort_order, q.sort_order) as effective_sort_order,
            COALESCE(qmm.required, q.required) as effective_required,
            COALESCE(qmm.question_text, q.question_text) as effective_question_text,
            COALESCE(qmm.help_text, q.help_text) as effective_help_text,
            qmm.custom_settings as question_custom_settings
          FROM questions q
          LEFT JOIN question_model_mappings qmm ON q.id = qmm.question_id AND qmm.model_id = $2
          WHERE q.group_id = $1 
            AND q.active = true 
            AND (qmm.active IS NULL OR qmm.active = true)
            AND (
              -- Include if no model restrictions
              q.device_model_ids IS NULL OR
              -- Include if model is in the allowed list
              q.device_model_ids::jsonb ? $2::text OR
              -- Include if specifically mapped via question_model_mappings
              qmm.id IS NOT NULL
            )
            AND (
              -- Exclude if model is in exclude list
              q.exclude_model_ids IS NULL OR
              NOT (q.exclude_model_ids::jsonb ? $2::text)
            )
          ORDER BY effective_sort_order ASC, q.question_text ASC
        `;
        
        const questionsResult = await client.query(questionQuery, [group.id, modelId]);
        
        // Get answer choices for each question with model-specific rates
        const questionsWithAnswers = [];
        
        for (const question of questionsResult.rows) {
          const answerQuery = `
            SELECT 
              ac.*,
              COALESCE(amm.weightage, ac.weightage) as effective_weightage,
              COALESCE(amm.repair_cost, ac.repair_cost) as effective_repair_cost,
              COALESCE(amm.answer_text, ac.answer_text) as effective_answer_text,
              COALESCE(amm.description, ac.description) as effective_description,
              COALESCE(amm.severity, ac.severity) as effective_severity,
              amm.custom_settings as answer_custom_settings
            FROM answer_choices ac
            LEFT JOIN answer_model_mappings amm ON ac.id = amm.answer_id AND amm.model_id = $2
            WHERE ac.question_id = $1 
              AND (amm.is_active IS NULL OR amm.is_active = true)
            ORDER BY ac.sort_order ASC, ac.answer_text ASC
          `;
          
          const answersResult = await client.query(answerQuery, [question.id, modelId]);
          
          questionsWithAnswers.push({
            ...question,
            answers: answersResult.rows
          });
        }
        
        groupsWithQuestions.push({
          ...group,
          questions: questionsWithAnswers
        });
      }
      
      res.json({
        model: model,
        questionGroups: groupsWithQuestions,
        totalGroups: groupsWithQuestions.length,
        totalQuestions: groupsWithQuestions.reduce((sum, group) => sum + group.questions.length, 0)
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching questions for model:', error);
    res.status(500).json({ error: 'Failed to fetch questions for model' });
  }
}

/**
 * Calculate accurate price with model-specific deductions
 */
export async function calculateModelSpecificPrice(req, res) {
  try {
    const { modelId } = req.params;
    const { answers, basePrice } = req.body; // answers: { questionId: answerId }

    console.log(`Calculating price for model ${modelId} with answers:`, answers);

    const client = await pool.connect();
    try {
      let totalDeduction = 0;
      let totalRepairCost = 0;
      const deductionBreakdown = [];
      
      // Process each answer
      for (const [questionId, answerId] of Object.entries(answers)) {
        // Get model-specific rates for this answer
        const rateQuery = `
          SELECT 
            ac.answer_text,
            COALESCE(amm.weightage, ac.weightage) as effective_weightage,
            COALESCE(amm.repair_cost, ac.repair_cost) as effective_repair_cost,
            COALESCE(amm.severity, ac.severity) as effective_severity,
            q.question_text
          FROM answer_choices ac
          JOIN questions q ON ac.question_id = q.id
          LEFT JOIN answer_model_mappings amm ON ac.id = amm.answer_id AND amm.model_id = $3
          WHERE ac.id = $1 AND ac.question_id = $2
        `;
        
        const rateResult = await client.query(rateQuery, [answerId, questionId, modelId]);
        
        if (rateResult.rows.length > 0) {
          const rate = rateResult.rows[0];
          const deduction = (basePrice * rate.effective_weightage) / 100;
          const repairCost = rate.effective_repair_cost || 0;
          
          totalDeduction += deduction;
          totalRepairCost += repairCost;
          
          deductionBreakdown.push({
            questionText: rate.question_text,
            answerText: rate.answer_text,
            severity: rate.effective_severity,
            weightage: rate.effective_weightage,
            deduction: deduction,
            repairCost: repairCost
          });
        }
      }
      
      const finalPrice = Math.max(50, basePrice - totalDeduction - totalRepairCost);
      
      res.json({
        basePrice: basePrice,
        totalDeduction: totalDeduction,
        totalRepairCost: totalRepairCost,
        finalPrice: finalPrice,
        deductionBreakdown: deductionBreakdown,
        calculatedAt: new Date().toISOString()
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error calculating model-specific price:', error);
    res.status(500).json({ error: 'Failed to calculate price' });
  }
}