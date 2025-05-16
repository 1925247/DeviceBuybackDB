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

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up API prefix
  const apiRouter = (path: string) => `/api${path}`;
  
  // Use API routes
  app.use('/api/partner-staff', partnerStaffRoutes);
  app.use('/api/indian', indianDataRoutes);
  
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

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}