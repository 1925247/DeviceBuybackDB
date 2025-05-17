import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db, pool } from "./db";
import pg from "pg";
import { sql, eq, and, asc, desc } from "drizzle-orm";
import { questionGroups, questions, answerChoices, productQuestionMappings } from "../shared/schema";
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

// Import API routes
import partnerStaffRoutes from "./api/partnerStaff";
import indianDataRoutes from "./api/indianData";
import { featureToggleRouter } from "./api/featureToggleApi";
import deviceModelsRoutes from "./api/deviceModels";
import brandsRoutes from "./api/brands";
import deviceTypesRoutes from "./api/deviceTypes";
import questionGroupsRoutes from "./api/questionGroups";
import questionsRoutes from "./api/questions";
import productQuestionMappingsRoutes from "./api/productQuestionMappings";
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
  app.use('/api/question-groups', questionGroupsRoutes);
  app.use('/api/questions', questionsRoutes);
  app.use('/api/product-question-mappings', productQuestionMappingsRoutes);
  app.use('/api/brand-device-types', brandDeviceTypesRoutes);
  app.use('/api/products', productsRoutes);
  
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

  // Feature Toggles API is imported and registered in line 25

  // Database status endpoint
  app.get(apiRouter("/status"), async (_req: Request, res: Response) => {
    try {
      const status = await storage.getDatabaseStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Failed to get database status" });
    }
  });
  
  // Condition questions API endpoint
  app.get(apiRouter("/condition-questions"), async (req: Request, res: Response) => {
    try {
      // Use the imported handler from conditionQuestionsHandler.ts
      await getConditionQuestions(req, res);
    } catch (error) {
      console.error("Error handling condition questions:", error);
      res.status(500).json({ message: "Failed to fetch condition questions" });
    }
  });
  
  // Device Models API endpoint
  app.get(apiRouter("/device-models"), async (req: Request, res: Response) => {
    try {
      const brandId = req.query.brand_id ? parseInt(req.query.brand_id as string) : undefined;
      const deviceTypeId = req.query.device_type_id ? parseInt(req.query.device_type_id as string) : undefined;
      
      const deviceModelsData = await storage.getDeviceModels(brandId, deviceTypeId);
      res.json(deviceModelsData);
    } catch (error: any) {
      console.error("Error fetching device models:", error);
      res.status(500).json({ message: error.message || "Failed to fetch device models" });
    }
  });

  // Brands API endpoint
  app.get(apiRouter("/brands"), async (req: Request, res: Response) => {
    try {
      const deviceTypeId = req.query.device_type_id ? parseInt(req.query.device_type_id as string) : undefined;
      const brandsData = await storage.getBrands(deviceTypeId);
      res.json(brandsData);
    } catch (error: any) {
      console.error("Error fetching brands:", error);
      res.status(500).json({ message: error.message || "Failed to fetch brands" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}