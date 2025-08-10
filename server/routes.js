import express from "express";
import { createServer } from "http";
import { storage } from "./storage.js";
import { db, pool } from "./db.js";
import pg from "pg";
import { sql, eq, and, asc, desc } from "drizzle-orm";
import { questionGroups, questions, answerChoices } from "../shared/schema.js";
import { 
  insertUserSchema, insertRouteRuleSchema,
  deviceModels, deviceModelVariants
} from "../shared/schema.js";
import { ZodError, z } from "zod";
import { fromZodError } from "zod-validation-error";
import path from "path";
import { uploadSingleImage, getFileUrl } from "./middleware/upload.js";
import { getConditionQuestions } from "./conditionQuestionsHandler.js";
import { getConditionQuestionsForModel, ensureDeviceQuestionMappingsTable, fixDeviceQuestionMappings } from "./api/conditionQuestions.js";
import { 
  getDeviceModelQuestions, 
  mapQuestionsToDeviceModel, 
  getAvailableQuestions,
  getQuestionMappingStats 
} from "./api/deviceModelQuestions.js";

// Import API routes
import partnerStaffRoutes from "./api/partnerStaff.js";
import indianDataRoutes from "./api/indianData.js";
import { featureToggleRouter } from "./api/featureToggleApi.js";
import deviceModelsRoutes from "./api/deviceModels.js";
import deviceModelVariantsRoutes from "./api/deviceModelVariants.js";
import adminVariantPricingRoutes from "./api/adminVariantPricing.js";
import brandsRoutes from "./api/brands.js";
import deviceTypesRoutes from "./api/deviceTypes.js";
// Import will be done dynamically below
import simpleQARoutes from "./api/simpleQA.js";
import simpleProductQuestionMappingsRoutes from "./api/simpleProductQuestionMappings.js";
import brandDeviceTypesRoutes from "./api/brandDeviceTypes.js";
import answerChoicesRoutes from "./api/answerChoicesApi.js";
import productsRoutes from "./api/products.js";
import errorReportsRoutes from "./api/errorReports.js";
import userFeedbackRoutes from "./api/userFeedback.js";
import { getVariantValuation, calculateVariantPrice } from "./api/variantValuation.js";
import { getModelSpecificQuestions, createSampleModelMappings } from "./api/modelSpecificQuestions.js";
import { 
  createModel, 
  addVariant, 
  getVariantMappings, 
  mapQuestionsToVariant, 
  getModelVariants,
  getModelsWithVariants 
} from "./api/integratedModelApi.js";


export async function registerRoutes(app) {
  // Set up API prefix
  const apiRouter = (path) => `/api${path}`;
  
  // Use API routes
  app.use('/api/partner-staff', partnerStaffRoutes);
  app.use('/api/indian', indianDataRoutes);
  app.use('/api/device-models', deviceModelsRoutes);
  app.use('/api/device-model-variants', deviceModelVariantsRoutes);
  app.use('/api/admin/variant-pricing', adminVariantPricingRoutes);
  
  // Variant valuation endpoints
  app.get('/api/device-model-variants/:model/:variant', getVariantValuation);
  app.post('/api/device-model-variants/:model/:variant/calculate-price', calculateVariantPrice);

  app.use('/api/brands', brandsRoutes);
  app.use('/api/device-types', deviceTypesRoutes);
  app.use('/api/brand-device-types', brandDeviceTypesRoutes);
  app.use('/api/products', productsRoutes);
  app.use('/api/error-reports', errorReportsRoutes);
  app.use('/api/user-feedback', userFeedbackRoutes);
  // Question groups will be handled via dynamic imports below
  app.use('/api/questions', simpleQARoutes);
  app.use('/api/product-question-mappings', simpleProductQuestionMappingsRoutes);
  app.use('/api/answer-choices', answerChoicesRoutes);
  
  // Feature Toggles API  
  app.use('/api/feature-toggles', featureToggleRouter);
  
  // Flexible Question Groups API - Import functions dynamically
  try {
    const flexibleQuestionsModule = await import("./api/flexibleQuestionGroupsApi.js");
    app.get('/api/flexible-question-groups/stats', flexibleQuestionsModule.getQuestionGroupsWithStats);
    app.post('/api/flexible-question-groups', flexibleQuestionsModule.createQuestionGroup);
    app.post('/api/flexible-question-groups/:groupId/map-models', flexibleQuestionsModule.mapGroupToModels);
    app.post('/api/flexible-question-groups/questions/:questionId/map-models', flexibleQuestionsModule.mapQuestionToModels);
    app.post('/api/flexible-question-groups/answers/:answerId/model-rates', flexibleQuestionsModule.setAnswerModelRates);
    app.get('/api/flexible-question-groups/models/:modelId/questions', flexibleQuestionsModule.getQuestionsForModel);
    app.post('/api/flexible-question-groups/models/:modelId/calculate-price', flexibleQuestionsModule.calculateModelSpecificPrice);
  } catch (error) {
    console.error('Failed to load flexible question groups API:', error);
  }
  
  // Model-Specific Questions API
  app.get('/api/model-specific-questions', getModelSpecificQuestions);
  app.post('/api/create-sample-mappings', createSampleModelMappings);
  
  // New Valuation API (Cashify-style)
  try {
    const newValuationModule = await import("./api/newValuationApi.js");
    app.post('/api/v2/calculate-valuation', newValuationModule.calculateDeviceValuation);
    app.get('/api/v2/model/:modelId/price-breakdown', newValuationModule.getModelPriceBreakdown);
    app.post('/api/v2/validate-answers', newValuationModule.validateModelAnswers);
    app.get('/api/v2/model/:modelId/assessment-flow', newValuationModule.getModelAssessmentFlow);
    
    // Old System Cleanup API
    const cleanupModule = await import("./utils/oldSystemCleanup.js");
    app.post('/api/v2/cleanup-old-system', async (req, res) => {
      const cleanup = await cleanupModule.cleanupOldPricingData();
      res.json(cleanup);
    });
    app.get('/api/v2/verify-new-system', async (req, res) => {
      const verification = await cleanupModule.verifyNewCalculationSystem();
      res.json(verification);
    });
    app.get('/api/v2/migration-report', async (req, res) => {
      const report = await cleanupModule.generateMigrationReport();
      res.json(report);
    });

    // Integrated Model Management APIs (new workflow) - Register before Vite middleware
    app.post('/api/admin/models', createModel);
    app.post('/api/admin/models/:modelId/variants', addVariant);
    app.put('/api/admin/variants/:variantId', async (req, res) => {
      try {
        const { variantId } = req.params;
        const updateData = {};
        
        // Only update fields that are provided
        if (req.body.variant_name || req.body.name) {
          updateData.variant_name = req.body.variant_name || req.body.name;
        }
        if (req.body.base_price || req.body.basePrice) {
          updateData.base_price = parseFloat(req.body.base_price || req.body.basePrice);
        }
        if (req.body.current_price || req.body.currentPrice) {
          updateData.current_price = parseFloat(req.body.current_price || req.body.currentPrice);
        }
        if (req.body.storage) {
          updateData.storage = req.body.storage;
        }
        if (req.body.color) {
          updateData.color = req.body.color;
        }
        if (req.body.active !== undefined) {
          updateData.active = req.body.active;
        }
        updateData.updated_at = new Date();
        
        // Use raw SQL to avoid Drizzle schema issues
        const queryText = `
          UPDATE device_model_variants 
          SET ${Object.keys(updateData).map((key, idx) => `${key} = $${idx + 2}`).join(', ')}
          WHERE id = $1
          RETURNING *
        `;
        
        const values = [parseInt(variantId), ...Object.values(updateData)];
        const result = await pool.query(queryText, values);
        
        if (result.rows.length > 0) {
          res.json(result.rows[0]);
        } else {
          res.status(404).json({ error: 'Variant not found' });
        }
      } catch (error) {
        console.error('Error updating variant:', error);
        res.status(500).json({ error: 'Failed to update variant', details: error.message });
      }
    });
    app.delete('/api/admin/variants/:variantId', async (req, res) => {
      try {
        const { variantId } = req.params;
        
        // Use raw SQL to avoid Drizzle schema issues
        const queryText = 'DELETE FROM device_model_variants WHERE id = $1';
        await pool.query(queryText, [parseInt(variantId)]);
        
        res.json({ success: true });
      } catch (error) {
        console.error('Error deleting variant:', error);
        res.status(500).json({ error: 'Failed to delete variant' });
      }
    });
    app.get('/api/admin/variants/:variantId/mappings', getVariantMappings);
    app.post('/api/admin/variants/:variantId/map-questions', mapQuestionsToVariant);
    app.get('/api/models/:modelId/variants', getModelVariants);
  } catch (error) {
    console.error('Failed to load new valuation API:', error);
  }

  // Create HTTP server before registering routes
  const server = createServer(app);

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Upload endpoint
  app.post(apiRouter("/upload"), uploadSingleImage, (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      const fileUrl = getFileUrl(req.file.filename);
      res.json({ url: fileUrl });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  });

  // Condition Questions API endpoints
  app.get(apiRouter("/model-condition-questions/:modelId"), getConditionQuestionsForModel);
  app.get(apiRouter("/ensure-mappings-table"), ensureDeviceQuestionMappingsTable);
  app.get(apiRouter("/fix-question-mappings"), fixDeviceQuestionMappings);

  // Question Groups Management API - Basic implementation
  app.get("/api/question-groups", async (req, res) => {
    try {
      const groups = await db.select().from(questionGroups).orderBy(asc(questionGroups.id));
      res.json(groups);
    } catch (error) {
      console.error("Error fetching question groups:", error);
      res.status(500).json({ error: "Failed to fetch question groups" });
    }
  });

  app.get("/api/question-groups/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const [group] = await db.select().from(questionGroups).where(eq(questionGroups.id, parseInt(id)));
      if (!group) return res.status(404).json({ error: "Question group not found" });
      res.json(group);
    } catch (error) {
      console.error("Error fetching question group:", error);
      res.status(500).json({ error: "Failed to fetch question group" });
    }
  });

  app.post("/api/question-groups", async (req, res) => {
    try {
      const { name, statement, category, device_types, active } = req.body;
      const [newGroup] = await db.insert(questionGroups).values({
        name,
        statement: statement || name,
        category: category || 'general',
        device_types: device_types || null,
        active: active !== undefined ? active : true
      }).returning();
      res.status(201).json(newGroup);
    } catch (error) {
      console.error("Error creating question group:", error);
      res.status(500).json({ error: "Failed to create question group" });
    }
  });

  app.get("/api/question-groups/:id/questions", async (req, res) => {
    try {
      const { id } = req.params;
      const groupQuestions = await db.select().from(questions).where(eq(questions.questionGroupId, parseInt(id)));
      
      const questionsWithAnswers = await Promise.all(
        groupQuestions.map(async (question) => {
          const answers = await db.select().from(answerChoices).where(eq(answerChoices.questionId, question.id));
          return { ...question, answers };
        })
      );
      
      res.json(questionsWithAnswers);
    } catch (error) {
      console.error("Error fetching group questions:", error);
      res.status(500).json({ error: "Failed to fetch group questions" });
    }
  });

  // Comprehensive Device Model Question Mapping endpoints (legacy)
  app.get(apiRouter("/device-models/:modelId/questions"), getDeviceModelQuestions);
  app.post(apiRouter("/device-models/:modelId/questions"), mapQuestionsToDeviceModel);
  app.get(apiRouter("/questions/available"), getAvailableQuestions);
  app.get(apiRouter("/question-mappings/stats"), getQuestionMappingStats);

  // Database status endpoint
  app.get(apiRouter("/status"), async (_req, res) => {
    try {
      const status = await storage.getDatabaseStatus();
      res.json(status);
    } catch (error) {
      console.error("Database status error:", error);
      res.status(500).json({ message: "Failed to fetch database status" });
    }
  });

  // Original condition questions endpoint
  app.get(apiRouter("/condition-questions"), async (req, res) => {
    try {
      const result = await getConditionQuestions(req, res);
    } catch (error) {
      console.error("Error in condition questions:", error);
      res.status(500).json({ error: "Failed to retrieve condition questions" });
    }
  });

  // Get device models
  app.get(apiRouter("/device-models"), async (req, res) => {
    try {
      const query = `
        SELECT 
          dm.id, 
          dm.name,
          dm.slug,
          dm.image,
          dm.price_start,
          b.id as brand_id,
          b.name as brand_name,
          b.slug as brand_slug,
          dt.id as device_type_id,
          dt.name as device_type_name,
          dt.slug as device_type_slug
        FROM device_models dm
        JOIN brands b ON dm.brand_id = b.id
        JOIN device_types dt ON dm.device_type_id = dt.id
        WHERE 1=1
      `;

      let params = [];
      let conditions = [];

      // Filter by device type
      if (req.query.deviceType) {
        conditions.push(`dt.slug = $${params.length + 1}`);
        params.push(req.query.deviceType);
      }

      // Filter by brand
      if (req.query.brand) {
        conditions.push(`b.slug = $${params.length + 1}`);
        params.push(req.query.brand);
      }

      // Add conditions to query
      let finalQuery = query;
      if (conditions.length > 0) {
        finalQuery += ` AND ${conditions.join(' AND ')}`;
      }

      finalQuery += ` ORDER BY dm.name`;

      const result = await pool.query(finalQuery, params);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching device models:", error);
      res.status(500).json({ error: "Failed to fetch device models" });
    }
  });

  // Get brands
  app.get(apiRouter("/brands"), async (req, res) => {
    try {
      let query = `
        SELECT DISTINCT b.id, b.name, b.slug, b.logo
        FROM brands b
        JOIN device_models dm ON b.id = dm.brand_id
      `;
      
      let params = [];
      
      if (req.query.deviceType) {
        query += `
          JOIN device_types dt ON dm.device_type_id = dt.id
          WHERE dt.slug = $1
        `;
        params.push(req.query.deviceType);
      }
      
      query += ` ORDER BY b.name`;
      
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching brands:", error);
      res.status(500).json({ error: "Failed to fetch brands" });
    }
  });

  // Enhanced condition questions for 4-step assessment
  app.get("/api/enhanced-condition-questions/:deviceType/:brand/:model", async (req, res) => {
    try {
      const { deviceType, brand, model } = req.params;
      
      console.log('Enhanced condition questions request:', { deviceType, brand, model });
      
      // Enhanced questions with categories for 4-step assessment
      const questions = [
        // Physical Condition Questions
        {
          id: 1,
          question_text: "What is the overall physical condition of your device?",
          description: "Check for scratches, dents, or other physical damage on the body",
          category: "physical",
          group: "physical",
          type: "multiple_choice",
          required: true,
          answer_choices: [
            { id: 1, choice_text: "Excellent - Like new", description: "No visible wear or damage", impact_percentage: 0 },
            { id: 2, choice_text: "Good - Minor wear", description: "Light scratches or wear", impact_percentage: -15 },
            { id: 3, choice_text: "Fair - Visible wear", description: "Noticeable scratches or scuffs", impact_percentage: -30 },
            { id: 4, choice_text: "Poor - Significant damage", description: "Major scratches, dents, or cracks", impact_percentage: -50 }
          ]
        },
        {
          id: 2,
          question_text: "Are there any cracks or damage to the device body?",
          description: "Check the back, sides, and frame of the device",
          category: "physical",
          group: "physical",
          type: "multiple_choice",
          required: true,
          answer_choices: [
            { id: 5, choice_text: "No damage", description: "Body is intact", impact_percentage: 0 },
            { id: 6, choice_text: "Minor hairline cracks", description: "Very small cracks", impact_percentage: -20 },
            { id: 7, choice_text: "Visible cracks", description: "Noticeable cracks", impact_percentage: -40 },
            { id: 8, choice_text: "Severely damaged", description: "Major cracks or broken parts", impact_percentage: -70 }
          ]
        },
        // Screen & Display Questions
        {
          id: 3,
          question_text: "What is the condition of the screen?",
          description: "Check for cracks, scratches, or display issues",
          category: "screen",
          group: "screen",
          type: "multiple_choice",
          required: true,
          answer_choices: [
            { id: 9, choice_text: "Perfect - No damage", description: "Screen is flawless", impact_percentage: 0 },
            { id: 10, choice_text: "Minor scratches", description: "Light scratches not affecting visibility", impact_percentage: -10 },
            { id: 11, choice_text: "Visible cracks", description: "Cracks but display works", impact_percentage: -40 },
            { id: 12, choice_text: "Severely damaged", description: "Major cracks or display issues", impact_percentage: -70 }
          ]
        },
        {
          id: 4,
          question_text: "How is the display quality and touch response?",
          description: "Test screen brightness, colors, and touch sensitivity",
          category: "screen",
          group: "screen",
          type: "multiple_choice",
          required: true,
          answer_choices: [
            { id: 13, choice_text: "Excellent - Works perfectly", description: "Bright, responsive, accurate colors", impact_percentage: 0 },
            { id: 14, choice_text: "Good - Minor issues", description: "Slight dimming or touch lag", impact_percentage: -15 },
            { id: 15, choice_text: "Fair - Noticeable issues", description: "Display problems or touch issues", impact_percentage: -30 },
            { id: 16, choice_text: "Poor - Major problems", description: "Severe display or touch problems", impact_percentage: -50 }
          ]
        },
        // Functionality Questions
        {
          id: 5,
          question_text: "Are all buttons and ports working properly?",
          description: "Test power button, volume buttons, charging port, and headphone jack",
          category: "functionality",
          group: "functionality",
          type: "multiple_choice",
          required: true,
          answer_choices: [
            { id: 17, choice_text: "All working perfectly", description: "Every button and port functions normally", impact_percentage: 0 },
            { id: 18, choice_text: "Most working, minor issues", description: "One or two buttons slightly sticky", impact_percentage: -15 },
            { id: 19, choice_text: "Some not working", description: "Some buttons or ports don't work", impact_percentage: -30 },
            { id: 20, choice_text: "Major functionality issues", description: "Multiple buttons or ports broken", impact_percentage: -45 }
          ]
        },
        {
          id: 6,
          question_text: "How are the camera and audio functions?",
          description: "Test camera quality, microphone, and speaker performance",
          category: "functionality",
          group: "functionality",
          type: "multiple_choice",
          required: true,
          answer_choices: [
            { id: 21, choice_text: "Excellent - All work perfectly", description: "Clear photos, good audio quality", impact_percentage: 0 },
            { id: 22, choice_text: "Good - Minor issues", description: "Slight quality reduction", impact_percentage: -10 },
            { id: 23, choice_text: "Fair - Noticeable problems", description: "Camera or audio issues", impact_percentage: -25 },
            { id: 24, choice_text: "Poor - Major problems", description: "Camera or audio not working", impact_percentage: -40 }
          ]
        },
        // Battery & Performance Questions
        {
          id: 7,
          question_text: "How is the battery performance?",
          description: "Consider how long the battery lasts and charging behavior",
          category: "battery",
          group: "battery",
          type: "multiple_choice",
          required: true,
          answer_choices: [
            { id: 25, choice_text: "Excellent - Lasts all day", description: "Battery life like new", impact_percentage: 0 },
            { id: 26, choice_text: "Good - Needs charging once a day", description: "Normal daily charging", impact_percentage: -10 },
            { id: 27, choice_text: "Fair - Needs frequent charging", description: "Multiple charges per day", impact_percentage: -25 },
            { id: 28, choice_text: "Poor - Battery drains quickly", description: "Very short battery life", impact_percentage: -40 }
          ]
        },
        {
          id: 8,
          question_text: "How is the overall device performance?",
          description: "Consider speed, app loading times, and system responsiveness",
          category: "battery",
          group: "battery",
          type: "multiple_choice",
          required: true,
          answer_choices: [
            { id: 29, choice_text: "Excellent - Fast and responsive", description: "No lag or performance issues", impact_percentage: 0 },
            { id: 30, choice_text: "Good - Occasional slowdowns", description: "Minor performance issues", impact_percentage: -15 },
            { id: 31, choice_text: "Fair - Noticeable lag", description: "Regular performance problems", impact_percentage: -30 },
            { id: 32, choice_text: "Poor - Very slow", description: "Severe performance issues", impact_percentage: -50 }
          ]
        }
      ];
      
      console.log('Returning 8 enhanced condition questions for 4-step assessment');
      res.json(questions);
    } catch (error) {
      console.error('Error getting enhanced condition questions:', error);
      res.status(500).json({ error: 'Failed to get enhanced condition questions' });
    }
  });

  // Condition Questions endpoint - Fixed implementation
  app.get("/api/condition-questions", async (req, res) => {
    console.log('Condition questions endpoint hit with params:', req.query);
    try {
      const questions = [
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
      
      console.log(`Returning ${questions.length} condition questions`);
      res.json(questions);
    } catch (error) {
      console.error('Error in condition questions endpoint:', error);
      res.status(500).json({ error: 'Failed to fetch condition questions' });
    }
  });

  const validateRequest = (schema, data) => {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(fromZodError(error).toString());
      }
      throw error;
    }
  };

  // Users CRUD operations
  app.get(apiRouter("/users"), async (_req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post(apiRouter("/users"), async (req, res) => {
    try {
      const userData = validateRequest(insertUserSchema, req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Route Rules CRUD operations
  app.get(apiRouter("/route-rules"), async (_req, res) => {
    try {
      const routeRules = await storage.getRouteRules();
      res.json(routeRules);
    } catch (error) {
      console.error("Error fetching route rules:", error);
      res.status(500).json({ message: "Failed to fetch route rules" });
    }
  });

  app.post(apiRouter("/route-rules"), async (req, res) => {
    try {
      const routeRuleData = validateRequest(insertRouteRuleSchema, req.body);
      const routeRule = await storage.createRouteRule(routeRuleData);
      res.status(201).json(routeRule);
    } catch (error) {
      console.error("Error creating route rule:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Buyback requests endpoint
  app.post("/api/buyback-requests", async (req, res) => {
    try {
      console.log('Received buyback request:', req.body);
      
      // Validate required fields
      const requiredFields = ['customerName', 'customerEmail', 'customerPhone'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        });
      }
      
      const request = await storage.createBuybackRequest(req.body);
      console.log('Created buyback request successfully:', request.id || request.order_id);
      
      res.status(201).json({ 
        success: true, 
        message: 'Buyback request created successfully',
        data: request,
        orderId: request.order_id || request.id
      });
    } catch (error) {
      console.error('Error creating buyback request:', error);
      console.error('Request body was:', req.body);
      res.status(500).json({ 
        error: 'Failed to create buyback request',
        message: error.message 
      });
    }
  });

  // Get buyback requests
  app.get("/api/buyback-requests", async (req, res) => {
    try {
      console.log('Fetching buyback requests...');
      const requests = await storage.getBuybackRequests();
      console.log(`Retrieved ${requests.length} requests`);
      res.json(requests);
    } catch (error) {
      console.error('Error fetching buyback requests:', error);
      res.status(500).json({ 
        error: 'Failed to fetch buyback requests', 
        details: error.message 
      });
    }
  });

  // Update buyback request
  app.put("/api/buyback-requests/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const request = await storage.updateBuybackRequest(parseInt(id), req.body);
      res.json(request);
    } catch (error) {
      console.error('Error updating buyback request:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Import advanced admin APIs
  const { 
    getModelsWithPricing, createModelPricing, updateModelPricing, deleteModelPricing,
    getPricingTiers, createPricingTier, calculateModelPrice, bulkUpdatePricing
  } = await import('./api/modelPricing.js');
  
  const {
    getQuestionGroups, getQuestionGroup, createQuestionGroup, updateQuestionGroup,
    deleteQuestionGroup, mapGroupToModel, removeGroupModelMapping, reorderQuestionGroups,
    getQuestionGroupsByDeviceType
  } = await import('./api/questionGroups.js');

  const {
    getAdminConfigurations, getAdminConfiguration, createAdminConfiguration,
    updateAdminConfiguration, deleteAdminConfiguration, getConfigValue,
    bulkUpdateConfigurations, initializeDefaultConfigurations
  } = await import('./api/adminConfigurations.js');

  const {
    getWorkingHours, updateWorkingHours, getAvailableTimeSlots,
    bookTimeSlot, getBookingStats
  } = await import('./api/workingHours.js');

  // Advanced pricing routes
  app.get('/api/models-pricing', getModelsWithPricing);
  app.post('/api/model-pricing', createModelPricing);
  app.patch('/api/model-pricing/:id', updateModelPricing);
  app.delete('/api/model-pricing/:id', deleteModelPricing);
  app.post('/api/model-pricing/calculate', calculateModelPrice);
  app.post('/api/model-pricing/bulk-update', bulkUpdatePricing);
  
  // Pricing tiers routes
  app.get('/api/pricing-tiers', getPricingTiers);
  app.post('/api/pricing-tiers', createPricingTier);
  
  // Question groups routes (advanced)
  app.get('/api/question-groups-advanced', getQuestionGroups);
  app.get('/api/question-groups-advanced/:id', getQuestionGroup);
  app.post('/api/question-groups-advanced', createQuestionGroup);
  app.patch('/api/question-groups-advanced/:id', updateQuestionGroup);
  app.delete('/api/question-groups-advanced/:id', deleteQuestionGroup);
  app.post('/api/question-groups-advanced/reorder', reorderQuestionGroups);
  app.get('/api/question-groups-advanced/device-type/:deviceTypeId', getQuestionGroupsByDeviceType);
  
  // Question-model mappings routes
  app.post('/api/question-model-mappings', mapGroupToModel);
  app.delete('/api/question-model-mappings/:mappingId', removeGroupModelMapping);

  // Admin configurations routes
  app.get('/api/admin-configurations', getAdminConfigurations);
  app.get('/api/admin-configurations/:key', getAdminConfiguration);
  app.post('/api/admin-configurations', createAdminConfiguration);
  app.patch('/api/admin-configurations/:id', updateAdminConfiguration);
  app.delete('/api/admin-configurations/:id', deleteAdminConfiguration);
  app.get('/api/config-value/:key', getConfigValue);
  app.post('/api/admin-configurations/bulk-update', bulkUpdateConfigurations);
  app.post('/api/admin-configurations/initialize', initializeDefaultConfigurations);

  // Working hours and time slots routes
  app.get('/api/working-hours', getWorkingHours);
  app.patch('/api/working-hours/:id', updateWorkingHours);
  app.get('/api/available-time-slots', getAvailableTimeSlots);
  app.post('/api/book-time-slot', bookTimeSlot);
  app.get('/api/booking-stats', getBookingStats);

  // Agent Management Endpoints
  app.get('/api/agents', async (req, res) => {
    try {
      // For now, return sample data. Later this can be connected to a database
      const agents = [
        {
          id: 1,
          name: 'Rahul Kumar',
          email: 'rahul.agent@gadgetswap.com',
          phone: '9876543210',
          address: 'Connaught Place, New Delhi',
          pincode: '110001',
          status: 'active',
          role: 'pickup_agent',
          assigned_orders: 8,
          completed_orders: 15,
          created_at: '2025-01-15T10:00:00Z'
        },
        {
          id: 2,
          name: 'Priya Sharma',
          email: 'priya.agent@gadgetswap.com',
          phone: '9876543211',
          address: 'Bandra West, Mumbai',
          pincode: '400050',
          status: 'active',
          role: 'pickup_agent',
          assigned_orders: 5,
          completed_orders: 22,
          created_at: '2025-01-10T09:00:00Z'
        },
        {
          id: 3,
          name: 'Amit Singh',
          email: 'amit.agent@gadgetswap.com',
          phone: '9876543212',
          address: 'Koramangala, Bangalore',
          pincode: '560095',
          status: 'inactive',
          role: 'pickup_agent',
          assigned_orders: 0,
          completed_orders: 8,
          created_at: '2025-01-05T08:00:00Z'
        }
      ];
      res.json(agents);
    } catch (error) {
      console.error('Error fetching agents:', error);
      res.status(500).json({ error: 'Failed to fetch agents' });
    }
  });

  app.post('/api/agents', async (req, res) => {
    try {
      const agentData = req.body;
      // For now, return success with generated ID
      const newAgent = {
        id: Date.now(),
        ...agentData,
        assigned_orders: 0,
        completed_orders: 0,
        created_at: new Date().toISOString()
      };
      res.status(201).json(newAgent);
    } catch (error) {
      console.error('Error creating agent:', error);
      res.status(500).json({ error: 'Failed to create agent' });
    }
  });

  app.put('/api/agents/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const agentData = req.body;
      // For now, return success
      res.json({ id: parseInt(id), ...agentData, updated_at: new Date().toISOString() });
    } catch (error) {
      console.error('Error updating agent:', error);
      res.status(500).json({ error: 'Failed to update agent' });
    }
  });

  app.delete('/api/agents/:id', async (req, res) => {
    try {
      const { id } = req.params;
      // For now, return success
      res.json({ message: 'Agent deleted successfully', id: parseInt(id) });
    } catch (error) {
      console.error('Error deleting agent:', error);
      res.status(500).json({ error: 'Failed to delete agent' });
    }
  });

  app.get('/api/buyback-requests/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const requests = await storage.getAllBuybackRequests();
      const request = requests.find(r => r.id === parseInt(id));
      
      if (!request) {
        return res.status(404).json({ error: 'Buyback request not found' });
      }
      
      res.json(request);
    } catch (error) {
      console.error('Error fetching buyback request:', error);
      res.status(500).json({ error: 'Failed to fetch buyback request' });
    }
  });

  // Agent Authentication Endpoints
  app.post('/api/agent/login', async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      // Check if user exists in Agent Management
      const agents = [
        {
          agent_id: 'AGENT001',
          username: 'rahul.agent',
          password_hash: 'hashed_password_1', // In real app, use bcrypt
          full_name: 'Rahul Kumar',
          phone: '9876543210',
          status: 'active'
        },
        {
          agent_id: 'AGENT002',
          username: 'priya.agent',
          password_hash: 'hashed_password_2',
          full_name: 'Priya Sharma',
          phone: '9876543211',
          status: 'active'
        }
      ];

      const agent = agents.find(a => a.username === username && a.status === 'active');

      if (!agent) {
        return res.status(401).json({ 
          error: 'Access Denied – Not Authorized as Agent' 
        });
      }

      // In real app, verify password with bcrypt
      if (password !== 'agent123') {
        return res.status(401).json({ 
          error: 'Invalid credentials' 
        });
      }

      // Generate simple token (in real app, use JWT)
      const token = `agent_${agent.agent_id}_${Date.now()}`;

      res.json({
        success: true,
        token,
        agent: {
          agent_id: agent.agent_id,
          full_name: agent.full_name,
          phone: agent.phone
        }
      });
    } catch (error) {
      console.error('Agent login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Get leads assigned to specific agent
  app.get('/api/agent/leads/:agentId', async (req, res) => {
    try {
      const { agentId } = req.params;
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No valid token provided' });
      }

      const token = authHeader.split(' ')[1];
      
      // Verify token contains the agent ID (simple validation)
      if (!token || !token.includes(agentId)) {
        return res.status(403).json({ error: 'Access denied - token mismatch' });
      }

      // Get all buyback requests and filter by assigned agent
      console.log('Fetching buyback requests for agent:', agentId);
      const allRequests = await storage.getAllBuybackRequests();
      console.log('All requests count:', allRequests.length);
      
      // Mock assigned leads (in real app, filter by assigned_agent_id)
      let agentLeads = [];
      
      if (agentId === 'AGENT001' && allRequests.length > 0) {
        agentLeads = allRequests.slice(0, Math.min(3, allRequests.length)).map(req => ({
          lead_id: req.id,
          customer_name: req.customer_name || 'Unknown Customer',
          customer_phone: req.customer_phone || 'No Phone',
          manufacturer: req.manufacturer || 'Unknown Brand',
          model: req.model || 'Unknown Model',
          base_price: req.offered_price || 0,
          customer_price: req.offered_price || 0,
          pickup_date: req.created_at,
          pickup_address: req.pickup_address || 'Address not provided',
          status: 'assigned',
          assigned_agent_id: agentId,
          created_at: req.created_at
        }));
      } else if (agentId === 'AGENT002' && allRequests.length > 3) {
        agentLeads = allRequests.slice(3, Math.min(5, allRequests.length)).map(req => ({
          lead_id: req.id,
          customer_name: req.customer_name || 'Unknown Customer',
          customer_phone: req.customer_phone || 'No Phone',
          manufacturer: req.manufacturer || 'Unknown Brand',
          model: req.model || 'Unknown Model',
          base_price: req.offered_price || 0,
          customer_price: req.offered_price || 0,
          pickup_date: req.created_at,
          pickup_address: req.pickup_address || 'Address not provided',
          status: 'assigned',
          assigned_agent_id: agentId,
          created_at: req.created_at
        }));
      }

      console.log('Agent leads prepared:', agentLeads.length);
      res.json(agentLeads);
    } catch (error) {
      console.error('Error fetching agent leads:', error);
      res.status(500).json({ error: 'Failed to fetch leads' });
    }
  });

  // Re-evaluation endpoint for agents
  app.get('/api/agent/lead/:leadId', async (req, res) => {
    try {
      const { leadId } = req.params;
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No valid token provided' });
      }

      // Get lead details (for re-evaluation)
      const allRequests = await storage.getAllBuybackRequests();
      const lead = allRequests.find(r => r.id === parseInt(leadId));
      
      if (!lead) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      // Mock lead details with customer answers
      const leadDetails = {
        lead_id: lead.id,
        customer_name: lead.customer_name,
        customer_phone: lead.customer_phone,
        manufacturer: lead.manufacturer,
        model: lead.model,
        base_price: lead.offered_price,
        customer_price: lead.offered_price,
        pickup_address: lead.pickup_address,
        customer_answers: [
          { question: 'Screen condition?', answer: 'Minor scratches', deduction: 5 },
          { question: 'Battery performance?', answer: 'Good (80-90%)', deduction: 0 },
          { question: 'Physical condition?', answer: 'Excellent', deduction: 0 },
          { question: 'Functional issues?', answer: 'None', deduction: 0 }
        ],
        status: 'assigned'
      };

      res.json(leadDetails);
    } catch (error) {
      console.error('Error fetching lead details:', error);
      res.status(500).json({ error: 'Failed to fetch lead details' });
    }
  });

  return server;
}