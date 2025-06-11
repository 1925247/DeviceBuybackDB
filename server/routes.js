import express from "express";
import { createServer } from "http";
import { storage } from "./storage.js";
import { db, pool } from "./db.js";
import pg from "pg";
import { sql, eq, and, asc, desc } from "drizzle-orm";
import { questionGroups, questions, answerChoices } from "../shared/schema.js";
import { 
  insertUserSchema, insertRouteRuleSchema,
  deviceModels
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
import brandsRoutes from "./api/brands.js";
import deviceTypesRoutes from "./api/deviceTypes.js";
import questionGroupsRoutes from "./api/questionGroups.js";
import simpleQARoutes from "./api/simpleQA.js";
import simpleProductQuestionMappingsRoutes from "./api/simpleProductQuestionMappings.js";
import brandDeviceTypesRoutes from "./api/brandDeviceTypes.js";
import answerChoicesRoutes from "./api/answerChoicesApi.js";
import productsRoutes from "./api/products.js";

export async function registerRoutes(app) {
  // Set up API prefix
  const apiRouter = (path) => `/api${path}`;
  
  // Use API routes
  app.use('/api/partner-staff', partnerStaffRoutes);
  app.use('/api/indian', indianDataRoutes);
  app.use('/api/device-models', deviceModelsRoutes);
  app.use('/api/brands', brandsRoutes);
  app.use('/api/device-types', deviceTypesRoutes);
  app.use('/api/brand-device-types', brandDeviceTypesRoutes);
  app.use('/api/products', productsRoutes);
  app.use('/api/question-groups', questionGroupsRoutes);
  app.use('/api/questions', simpleQARoutes);
  app.use('/api/product-question-mappings', simpleProductQuestionMappingsRoutes);
  app.use('/api/answer-choices', answerChoicesRoutes);
  
  // Feature Toggles API  
  app.use('/api/feature-toggles', featureToggleRouter);

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

  // Question Groups Management API

  // Question Groups endpoints
  app.get("/api/question-groups", getQuestionGroups);
  app.get("/api/question-groups/:id", getQuestionGroup);
  app.post("/api/question-groups", createQuestionGroup);
  app.put("/api/question-groups/:id", updateQuestionGroup);
  app.delete("/api/question-groups/:id", deleteQuestionGroup);
  app.get("/api/question-groups/:id/questions", getGroupQuestions);
  app.put("/api/question-groups/:id/reorder", reorderQuestionGroup);
  app.get("/api/question-groups/device/:deviceType", getQuestionGroupsByDeviceType);

  // Questions endpoints
  app.get("/api/questions", getQuestions);
  app.get("/api/questions/:id", getQuestion);
  app.post("/api/questions", createQuestion);
  app.put("/api/questions/:id", updateQuestion);
  app.delete("/api/questions/:id", deleteQuestion);
  app.get("/api/questions/models", getQuestionsForDeviceModels);
  app.get("/api/questions/brands", getQuestionsForBrands);

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

  return server;
}