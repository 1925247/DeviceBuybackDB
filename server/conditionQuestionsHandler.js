import { pool } from "./db.js";

/**
 * Handles fetching condition questions for device assessment
 */
export async function getConditionQuestions(req, res) {
  try {
    const { deviceType, brand, model, modelId } = req.query;
    
    console.log('Condition questions request:', { deviceType, brand, model, modelId });
    
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
        console.log('Found model ID:', targetModelId, 'for', deviceType, brand, model);
      }
    }
    
    // Try to get mapped questions first
    if (targetModelId) {
      try {
        // Check if model has advanced questions enabled
        const modeQuery = `
          SELECT question_mode, enable_advanced 
          FROM model_question_modes 
          WHERE model_id = $1
        `;
        const modeResult = await pool.query(modeQuery, [targetModelId]);
        const modelMode = modeResult.rows[0] || { question_mode: 'standard', enable_advanced: false };
        
        // Build question filter based on model mode
        let questionLevelFilter = '';
        if (modelMode.question_mode === 'standard') {
          questionLevelFilter = "AND qg.question_level = 'standard'";
        } else if (modelMode.question_mode === 'advanced') {
          questionLevelFilter = "AND qg.question_level = 'advanced'";
        } else if (modelMode.question_mode === 'both') {
          questionLevelFilter = "AND qg.question_level IN ('standard', 'advanced', 'both')";
        }
        
        const query = `
          SELECT DISTINCT
            q.id,
            q.question_text,
            q.question_type,
            q.sort_order,
            q.tooltip,
            q.help_text,
            q.required,
            qg.category,
            qg.name as group_name,
            qg.question_level,
            qg.sort_order as group_sort_order,
            (
              SELECT json_agg(
                json_build_object(
                  'id', ac.id,
                  'text', ac.text,
                  'value', ac.value,
                  'impact', COALESCE(ac.percentage_impact, 0)
                ) ORDER BY ac.sort_order
              )
              FROM answer_choices ac 
              WHERE ac.question_id = q.id
            ) as options
          FROM questions q
          JOIN question_groups qg ON q.group_id = qg.id
          JOIN group_model_mappings gmm ON qg.id = gmm.group_id
          WHERE gmm.model_id = $1 
          AND gmm.active = true
          AND q.active = true
          AND qg.active = true
          ${questionLevelFilter}
          ORDER BY qg.sort_order, q.sort_order
        `;
        
        const result = await pool.query(query, [targetModelId]);
        
        if (result.rows.length > 0) {
          // Transform to frontend format
          const questions = result.rows.map(row => ({
            id: row.id,
            question: row.question_text,
            type: row.question_type || 'multiple_choice',
            required: row.required || true,
            options: row.options || []
          }));
          
          console.log(`Returning ${questions.length} mapped questions for model ID ${targetModelId}`);
          return res.json(questions);
        }
      } catch (mappingError) {
        console.log('Error fetching mapped questions, falling back to standard questions:', mappingError);
      }
    }
    
    // Fallback to standard device assessment questions
    const questionsData = [
      {
        id: 1,
        question: "What is the overall physical condition of your device?",
        type: "multiple_choice",
        required: true,
        options: [
          { id: 1, text: "Excellent - Like new", value: "excellent", impact: 0 },
          { id: 2, text: "Good - Minor wear", value: "good", impact: -15 },
          { id: 3, text: "Fair - Visible wear", value: "fair", impact: -30 },
          { id: 4, text: "Poor - Significant damage", value: "poor", impact: -50 }
        ]
      },
      {
        id: 2,
        question: "Does the screen have any cracks or damage?",
        type: "multiple_choice", 
        required: true,
        options: [
          { id: 5, text: "No damage", value: "no_damage", impact: 0 },
          { id: 6, text: "Minor scratches", value: "minor_scratches", impact: -10 },
          { id: 7, text: "Visible cracks", value: "cracks", impact: -40 },
          { id: 8, text: "Severely damaged", value: "severe_damage", impact: -70 }
        ]
      },
      {
        id: 3,
        question: "How is the battery performance?",
        type: "multiple_choice",
        required: true,
        options: [
          { id: 9, text: "Excellent - Lasts all day", value: "battery_excellent", impact: 0 },
          { id: 10, text: "Good - Minor reduction", value: "battery_good", impact: -5 },
          { id: 11, text: "Fair - Noticeable decrease", value: "battery_fair", impact: -15 },
          { id: 12, text: "Poor - Needs frequent charging", value: "battery_poor", impact: -25 }
        ]
      },
      {
        id: 4,
        question: "Are all functions working properly?",
        type: "multiple_choice",
        required: true,
        options: [
          { id: 13, text: "All functions work perfectly", value: "functions_perfect", impact: 0 },
          { id: 14, text: "Minor issues with some functions", value: "functions_minor", impact: -10 },
          { id: 15, text: "Several functions not working", value: "functions_several", impact: -25 },
          { id: 16, text: "Major functionality issues", value: "functions_major", impact: -40 }
        ]
      }
    ];
    
    console.log(`Returning ${questionsData.length} standard condition questions`);
    return res.json(questionsData);
    
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
        console.log('Found Samsung Galaxy S21 product ID:', samsungProductId);
      }
      
      // Return Samsung Galaxy S21 specific questions
      questionsData = [
        {
          id: 1,
          question: "What is the overall physical condition of your Samsung Galaxy S21?",
          deviceTypeId: 1,
          order: 1,
          active: true,
          options: [
            { id: 1, text: "Excellent", value: "excellent" },
            { id: 2, text: "Good", value: "good" },
            { id: 3, text: "Fair", value: "fair" },
            { id: 4, text: "Poor", value: "poor" }
          ]
        },
        {
          id: 2,
          question: "Does the screen have any cracks or damage?",
          deviceTypeId: 1,
          order: 2,
          active: true,
          options: [
            { id: 5, text: "No damage", value: "no_damage" },
            { id: 6, text: "Minor scratches", value: "minor_scratches" },
            { id: 7, text: "Cracked screen", value: "cracked_screen" },
            { id: 8, text: "Severely damaged", value: "severely_damaged" }
          ]
        },
        {
          id: 3,
          question: "How is the battery performance?",
          deviceTypeId: 1,
          order: 3,
          active: true,
          options: [
            { id: 9, text: "Excellent (lasts all day)", value: "excellent_battery" },
            { id: 10, text: "Good (lasts most of the day)", value: "good_battery" },
            { id: 11, text: "Fair (needs charging often)", value: "fair_battery" },
            { id: 12, text: "Poor (needs constant charging)", value: "poor_battery" }
          ]
        },
        {
          id: 4,
          question: "Are all buttons and ports working properly?",
          deviceTypeId: 1,
          order: 4,
          active: true,
          options: [
            { id: 13, text: "All working perfectly", value: "all_working" },
            { id: 14, text: "Minor issues", value: "minor_issues" },
            { id: 15, text: "Some not working", value: "some_not_working" },
            { id: 16, text: "Multiple issues", value: "multiple_issues" }
          ]
        }
      ];
      
      return res.json(questionsData);
    }
    
    // Default behavior for other devices
    console.log('Fetching condition questions for deviceTypeId:', deviceTypeId, 'modelId:', modelId);
    
    // Query to get condition questions
    let query = `
      SELECT 
        cq.id,
        cq.question,
        cq.device_type_id as "deviceTypeId",
        cq."order",
        cq.active
      FROM condition_questions cq
      WHERE cq.active = true
    `;
    
    let params = [];
    
    if (deviceTypeId) {
      query += ` AND cq.device_type_id = $${params.length + 1}`;
      params.push(deviceTypeId);
    }
    
    query += ` ORDER BY cq."order"`;
    
    const questionsResult = await pool.query(query, params);
    
    // For each question, get its answers
    for (const question of questionsResult.rows) {
      const answersResult = await pool.query(
        `SELECT id, answer as text, value FROM condition_answers WHERE question_id = $1 AND active = true ORDER BY id`,
        [question.id]
      );
      
      question.options = answersResult.rows;
      questionsData.push(question);
    }
    
    console.log(`Returning ${questionsData.length} condition questions`);
    res.json(questionsData);
    
  } catch (error) {
    console.error("Error fetching condition questions:", error);
    res.status(500).json({ 
      error: "Failed to fetch condition questions", 
      details: error.message 
    });
  }
}