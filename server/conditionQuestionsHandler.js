import { pool } from "./db.js";

/**
 * Handles fetching condition questions for device assessment
 */
export async function getConditionQuestions(req, res) {
  try {
    const deviceTypeId = req.query.deviceTypeId ? Number(req.query.deviceTypeId) : undefined;
    const modelId = req.query.modelId ? Number(req.query.modelId) : undefined;
    const modelName = req.query.model ? String(req.query.model) : undefined;
    const modelSlug = req.query.modelSlug ? String(req.query.modelSlug) : undefined;
    
    let questionsData = [];
    
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