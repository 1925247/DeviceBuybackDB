import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db, pool } from "./db";
import pg from "pg";
import { sql, eq, and, asc, desc } from "drizzle-orm";
import { questionGroups, questions, answerChoices } from "../shared/schema";
import { 
  insertUserSchema, insertRouteRuleSchema, insertBuybackRequestSchema,
  type InsertUser, type InsertRouteRule, type InsertBuybackRequest,
  deviceModels
} from "@shared/schema";
import { ZodError, z } from "zod";
import { fromZodError } from "zod-validation-error";
import path from "path";
import { uploadSingleImage, getFileUrl } from "./middleware/upload";
import { getConditionQuestions } from "./conditionQuestionsHandler";
import { getConditionQuestionsForModel, ensureDeviceQuestionMappingsTable, fixDeviceQuestionMappings } from "./api/conditionQuestions";

// Import API routes
import partnerStaffRoutes from "./api/partnerStaff";
import indianDataRoutes from "./api/indianData";
import { featureToggleRouter } from "./api/featureToggleApi";
import deviceModelsRoutes from "./api/deviceModels";
import brandsRoutes from "./api/brands";
import deviceTypesRoutes from "./api/deviceTypes";
import questionGroupsRoutes from "./api/questionGroups";
import simpleQuestionGroupsRoutes from "./api/simpleQuestionGroups";
import fixedQuestionGroupsRoutes from "./api/fixedQuestionGroups";
import questionsRoutes from "./api/questions";
import simpleQuestionsRoutes from "./api/simpleQuestions";
import fixedQuestionsRoutes from "./api/fixedQuestions";
import basicQuestionsRoutes from "./api/basicQuestions";
import questionsAdapterRoutes from "./api/questionsAdapterAPI";
import simpleQARoutes from "./api/simpleQA";
import simpleProductQuestionMappingsRoutes from "./api/simpleProductQuestionMappings";
import brandDeviceTypesRoutes from "./api/brandDeviceTypes";
import productsRoutes from "./api/products";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up API prefix
  const apiRouter = (path: string) => `/api${path}`;
  
  // Use API routes
  app.use('/api/partner-staff', partnerStaffRoutes);
  app.use('/api/indian', indianDataRoutes);
  app.use('/api/device-models', deviceModelsRoutes);
  app.use('/api/brands', brandsRoutes);
  app.use('/api/device-types', deviceTypesRoutes);
  app.use('/api/brand-device-types', brandDeviceTypesRoutes);
  app.use('/api/products', productsRoutes);
  app.use('/api/question-groups', fixedQuestionGroupsRoutes);
  app.use('/api/questions', simpleQARoutes);
  
  // Feature toggles API routes
  try {
    app.use('/api/feature-toggles', featureToggleRouter);
  } catch (error) {
    console.error("Error registering feature toggles routes:", error);
  }

  // File upload endpoints
  app.post(apiRouter("/upload"), uploadSingleImage, (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const fileUrl = getFileUrl(req.file.filename);
      return res.status(200).json({ 
        message: "File uploaded successfully", 
        url: fileUrl 
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      return res.status(500).json({ message: "Upload failed: " + error.message });
    }
  });

  // Helper for handling validation errors
  const validateRequest = <T>(schema: any, data: unknown): T => {
    try {
      const result = schema.parse(data);
      return result as T;
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        throw { status: 400, message: validationError.message };
      }
      throw error;
    }
  };

  // Feature Toggles API is registered above
  
  // Condition Questions API endpoints
  app.get(apiRouter("/model-condition-questions/:modelId"), getConditionQuestionsForModel);
  app.get(apiRouter("/ensure-mappings-table"), ensureDeviceQuestionMappingsTable);
  app.get(apiRouter("/fix-question-mappings"), fixDeviceQuestionMappings);

  // Database status endpoint
  app.get(apiRouter("/status"), async (_req: Request, res: Response) => {
    try {
      const status = await storage.getDatabaseStatus();
      res.json(status);
    } catch (error) {
      console.error("Database status error:", error);
      res.status(500).json({ message: "Failed to fetch database status" });
    }
  });

  // Original condition questions endpoint
  app.get(apiRouter("/condition-questions"), async (req: Request, res: Response) => {
    try {
      const result = await getConditionQuestions(req, res);
    } catch (error) {
      console.error("Error in condition questions:", error);
      res.status(500).json({ error: "Failed to retrieve condition questions" });
    }
  });

  // Get device models
  app.get(apiRouter("/device-models"), async (req: Request, res: Response) => {
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
      const finalQuery = conditions.length > 0
        ? `${query} AND ${conditions.join(' AND ')}`
        : query;

      const result = await db.execute(sql.raw(finalQuery + ` ORDER BY dm.name`), params);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching device models:", error);
      res.status(500).json({ message: "Failed to fetch device models" });
    }
  });

  // Get brands
  app.get(apiRouter("/brands"), async (req: Request, res: Response) => {
    try {
      const query = `
        SELECT 
          b.id, 
          b.name,
          b.slug,
          b.logo,
          b.description,
          COUNT(dm.id) as model_count
        FROM brands b
        LEFT JOIN device_models dm ON b.id = dm.brand_id
      `;

      let params = [];
      let conditions = [];

      // Filter by device type
      if (req.query.deviceType) {
        conditions.push(`dm.device_type_id = (SELECT id FROM device_types WHERE slug = $${params.length + 1})`);
        params.push(req.query.deviceType);
      }

      // Add conditions and group by
      const groupBy = ` GROUP BY b.id ORDER BY b.name`;
      const finalQuery = conditions.length > 0
        ? `${query} WHERE ${conditions.join(' AND ')}${groupBy}`
        : `${query}${groupBy}`;

      const result = await db.execute(sql.raw(finalQuery), params);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching brands:", error);
      res.status(500).json({ message: "Failed to fetch brands" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}