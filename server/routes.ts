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
  
  // Device types API endpoints
  app.get(apiRouter("/device-types"), async (_req: Request, res: Response) => {
    try {
      const deviceTypesData = await storage.getDeviceTypes();
      res.json(deviceTypesData);
    } catch (error: any) {
      console.error("Error fetching device types:", error);
      res.status(500).json({ message: error.message || "Failed to fetch device types" });
    }
  });

  app.get(apiRouter("/device-types/:id"), async (req: Request, res: Response) => {
    try {
      const deviceTypeId = parseInt(req.params.id);
      if (isNaN(deviceTypeId)) {
        return res.status(400).json({ message: "Invalid device type ID" });
      }
      
      const deviceType = await storage.getDeviceType(deviceTypeId);
      if (!deviceType) {
        return res.status(404).json({ message: "Device type not found" });
      }
      
      res.json(deviceType);
    } catch (error: any) {
      console.error("Error fetching device type:", error);
      res.status(500).json({ message: error.message || "Failed to fetch device type" });
    }
  });
  
  app.post(apiRouter("/device-types"), async (req: Request, res: Response) => {
    try {
      const { name, slug, icon, active = true } = req.body;
      
      if (!name || !slug) {
        return res.status(400).json({ message: "Name and slug are required" });
      }
      
      const deviceType = await storage.createDeviceType({ name, slug, icon, active });
      res.status(201).json(deviceType);
    } catch (error: any) {
      console.error("Error creating device type:", error);
      res.status(500).json({ message: error.message || "Failed to create device type" });
    }
  });
  
  app.put(apiRouter("/device-types/:id"), async (req: Request, res: Response) => {
    try {
      const deviceTypeId = parseInt(req.params.id);
      if (isNaN(deviceTypeId)) {
        return res.status(400).json({ message: "Invalid device type ID" });
      }
      
      const { name, slug, icon, active } = req.body;
      
      if (!name || !slug) {
        return res.status(400).json({ message: "Name and slug are required" });
      }
      
      const updatedDeviceType = await storage.updateDeviceType(deviceTypeId, { name, slug, icon, active });
      
      if (!updatedDeviceType) {
        return res.status(404).json({ message: "Device type not found" });
      }
      
      res.json(updatedDeviceType);
    } catch (error: any) {
      console.error("Error updating device type:", error);
      res.status(500).json({ message: error.message || "Failed to update device type" });
    }
  });
  
  app.delete(apiRouter("/device-types/:id"), async (req: Request, res: Response) => {
    try {
      const deviceTypeId = parseInt(req.params.id);
      if (isNaN(deviceTypeId)) {
        return res.status(400).json({ message: "Invalid device type ID" });
      }
      
      const result = await storage.deleteDeviceType(deviceTypeId);
      
      if (!result.success) {
        // Different status codes based on the error
        if (result.error?.includes('not found')) {
          return res.status(404).json({ message: result.error });
        } else if (result.error?.includes('associated with it')) {
          return res.status(409).json({ message: result.error });
        } else {
          return res.status(400).json({ message: result.error || "Could not delete device type" });
        }
      }
      
      res.status(200).json({ message: "Device type deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting device type:", error);
      res.status(500).json({ message: error.message || "Failed to delete device type" });
    }
  });

  // Partners API endpoints
  app.get(apiRouter("/partners"), async (_req: Request, res: Response) => {
    try {
      const partnersData = await storage.getPartners();
      res.json(partnersData);
    } catch (error: any) {
      console.error("Error fetching partners:", error);
      res.status(500).json({ message: error.message || "Failed to fetch partners" });
    }
  });
  
  app.get(apiRouter("/partners/:id"), async (req: Request, res: Response) => {
    try {
      const partnerId = parseInt(req.params.id);
      const partner = await storage.getPartner(partnerId);
      
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      
      res.json(partner);
    } catch (error: any) {
      console.error("Error fetching partner:", error);
      res.status(500).json({ message: error.message || "Failed to fetch partner" });
    }
  });
  
  // Regions API endpoints
  app.get(apiRouter("/regions"), async (_req: Request, res: Response) => {
    try {
      const regionsData = await storage.getRegions();
      res.json(regionsData);
    } catch (error: any) {
      console.error("Error fetching regions:", error);
      res.status(500).json({ message: error.message || "Failed to fetch regions" });
    }
  });
  
  // Routes API endpoints
  app.get(apiRouter("/routes"), async (_req: Request, res: Response) => {
    try {
      const routeRules = await storage.getRouteRules();
      res.json(routeRules);
    } catch (error: any) {
      console.error("Error fetching route rules:", error);
      res.status(500).json({ message: error.message || "Failed to fetch route rules" });
    }
  });
  
  app.get(apiRouter("/routes/:id"), async (req: Request, res: Response) => {
    try {
      const routeId = parseInt(req.params.id);
      const route = await storage.getRouteRule(routeId);
      
      if (!route) {
        return res.status(404).json({ message: "Route rule not found" });
      }
      
      res.json(route);
    } catch (error: any) {
      console.error("Error fetching route rule:", error);
      res.status(500).json({ message: error.message || "Failed to fetch route rule" });
    }
  });
  
  app.post(apiRouter("/routes"), async (req: Request, res: Response) => {
    try {
      const validatedData = insertRouteRuleSchema.parse(req.body);
      const newRoute = await storage.createRouteRule(validatedData);
      res.status(201).json(newRoute);
    } catch (error: any) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Error creating route rule:", error);
      res.status(500).json({ message: error.message || "Failed to create route rule" });
    }
  });
  
  app.put(apiRouter("/routes/:id"), async (req: Request, res: Response) => {
    try {
      const routeId = parseInt(req.params.id);
      const route = await storage.getRouteRule(routeId);
      
      if (!route) {
        return res.status(404).json({ message: "Route rule not found" });
      }
      
      const validatedData = insertRouteRuleSchema.partial().parse(req.body);
      const updatedRoute = await storage.updateRouteRule(routeId, validatedData);
      res.json(updatedRoute);
    } catch (error: any) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Error updating route rule:", error);
      res.status(500).json({ message: error.message || "Failed to update route rule" });
    }
  });
  
  app.delete(apiRouter("/routes/:id"), async (req: Request, res: Response) => {
    try {
      const routeId = parseInt(req.params.id);
      const route = await storage.getRouteRule(routeId);
      
      if (!route) {
        return res.status(404).json({ message: "Route rule not found" });
      }
      
      await storage.deleteRouteRule(routeId);
      res.json({ message: "Route rule deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting route rule:", error);
      res.status(500).json({ message: error.message || "Failed to delete route rule" });
    }
  });
  
  app.post(apiRouter("/routes/:id/priority"), async (req: Request, res: Response) => {
    try {
      const routeId = parseInt(req.params.id);
      const { direction } = req.body;
      
      if (direction !== 'up' && direction !== 'down') {
        return res.status(400).json({ message: "Direction must be 'up' or 'down'" });
      }
      
      const route = await storage.getRouteRule(routeId);
      
      if (!route) {
        return res.status(404).json({ message: "Route rule not found" });
      }
      
      const updatedRoute = await storage.changeRoutePriority(routeId, direction);
      res.json(updatedRoute);
    } catch (error: any) {
      console.error("Error changing route priority:", error);
      res.status(500).json({ message: error.message || "Failed to change route priority" });
    }
  });
  
  // Enhanced PIN code-based lead assignment with fallback to nearest partner
  app.post(apiRouter("/assign-lead"), async (req: Request, res: Response) => {
    try {
      const { pin_code, lead_id } = req.body;
      
      if (!pin_code || !lead_id) {
        return res.status(400).json({ message: "PIN code and lead ID are required" });
      }
      
      // Find partner by PIN code with exact match
      let partner = await storage.getPartnerByPinCode(pin_code);
      let exactMatch = true;
      
      // If no exact match found, try to find a partner in a nearby area
      if (!partner) {
        partner = await storage.findNearestPartnerByPinCode(pin_code);
        exactMatch = false;
        
        // If still no partner found
        if (!partner) {
          return res.status(404).json({ 
            message: "No partner found for the given PIN code or nearby areas", 
            suggestion: "Try a different PIN code or add this area to a partner's serviceable regions"
          });
        }
      }
      
      // Assign lead to partner
      const updatedLead = await storage.assignLeadToPartner(lead_id, partner.id);
      
      if (!updatedLead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json({ 
        message: "Lead assigned successfully", 
        lead: updatedLead,
        partner_name: partner.name,
        exact_match: exactMatch,
        matching_pin: exactMatch ? pin_code : partner.pincode,
        note: exactMatch ? "Exact PIN code match found" : "Assigned to nearest available partner"
      });
    } catch (error: any) {
      console.error("Error assigning lead:", error);
      res.status(500).json({ message: error.message || "Failed to assign lead" });
    }
  });
  
  // Partner Wallet API Endpoints
  
  // Get partner wallet
  app.get(apiRouter("/partners/:partnerId/wallet"), async (req: Request, res: Response) => {
    try {
      const partnerId = parseInt(req.params.partnerId);
      const wallet = await storage.getPartnerWallet(partnerId);
      
      if (!wallet) {
        // Create a new wallet if one doesn't exist
        const newWallet = await storage.createPartnerWallet({
          partner_id: partnerId,
          balance: "0",
        });
        
        return res.json(newWallet);
      }
      
      res.json(wallet);
    } catch (error: any) {
      console.error("Error fetching partner wallet:", error);
      res.status(500).json({ message: error.message || "Failed to fetch partner wallet" });
    }
  });
  
  // Get wallet transactions
  app.get(apiRouter("/partners/:partnerId/wallet/transactions"), async (req: Request, res: Response) => {
    try {
      const partnerId = parseInt(req.params.partnerId);
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      // Get wallet first
      const wallet = await storage.getPartnerWallet(partnerId);
      
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found for this partner" });
      }
      
      const transactions = await storage.getWalletTransactions(wallet.id, page, limit);
      
      res.json(transactions);
    } catch (error: any) {
      console.error("Error fetching wallet transactions:", error);
      res.status(500).json({ message: error.message || "Failed to fetch wallet transactions" });
    }
  });
  
  // Add funds to wallet
  app.post(apiRouter("/partners/:partnerId/wallet/add-funds"), async (req: Request, res: Response) => {
    try {
      const partnerId = parseInt(req.params.partnerId);
      const { amount, description, reference, paymentMethod, transactionId } = req.body;
      
      if (!amount || !description) {
        return res.status(400).json({ message: "Amount and description are required" });
      }
      
      const transaction = await storage.addFundsToWallet(
        partnerId,
        parseFloat(amount),
        description,
        reference,
        paymentMethod || 'online',
        transactionId
      );
      
      res.json({
        message: "Funds added successfully",
        transaction,
      });
    } catch (error: any) {
      console.error("Error adding funds to wallet:", error);
      res.status(500).json({ message: error.message || "Failed to add funds to wallet" });
    }
  });
  
  // Create withdrawal request
  app.post(apiRouter("/partners/:partnerId/wallet/withdrawal"), async (req: Request, res: Response) => {
    try {
      const partnerId = parseInt(req.params.partnerId);
      const { amount, payment_method, payment_details, notes } = req.body;
      
      if (!amount || !payment_method) {
        return res.status(400).json({ message: "Amount and payment method are required" });
      }
      
      // Get wallet first
      const wallet = await storage.getPartnerWallet(partnerId);
      
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found for this partner" });
      }
      
      // Check if enough balance
      if (parseFloat(wallet.balance.toString()) < parseFloat(amount)) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }
      
      const withdrawalRequest = await storage.createWithdrawalRequest({
        wallet_id: wallet.id,
        amount: amount.toString(),
        payment_method,
        payment_details: payment_details || {},
        notes,
      });
      
      res.json({
        message: "Withdrawal request created successfully",
        withdrawalRequest,
      });
    } catch (error: any) {
      console.error("Error creating withdrawal request:", error);
      res.status(500).json({ message: error.message || "Failed to create withdrawal request" });
    }
  });
  
  // Get withdrawal requests
  app.get(apiRouter("/partners/:partnerId/wallet/withdrawals"), async (req: Request, res: Response) => {
    try {
      const partnerId = parseInt(req.params.partnerId);
      const status = req.query.status as string;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      // Get wallet first
      const wallet = await storage.getPartnerWallet(partnerId);
      
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found for this partner" });
      }
      
      const withdrawals = await storage.getWithdrawalRequests(wallet.id, status, page, limit);
      
      res.json(withdrawals);
    } catch (error: any) {
      console.error("Error fetching withdrawal requests:", error);
      res.status(500).json({ message: error.message || "Failed to fetch withdrawal requests" });
    }
  });
  
  // Get all withdrawal requests (Admin only)
  app.get(apiRouter("/withdrawal-requests"), async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      const withdrawals = await storage.getAllWithdrawalRequests(status, page, limit);
      
      res.json(withdrawals);
    } catch (error: any) {
      console.error("Error fetching all withdrawal requests:", error);
      res.status(500).json({ message: error.message || "Failed to fetch withdrawal requests" });
    }
  });

  // Process withdrawal request (Admin only)
  app.put(apiRouter("/withdrawal-requests/:id/process"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status, notes, admin_id } = req.body;
      
      if (!status || !notes || !admin_id) {
        return res.status(400).json({ message: "Status, notes, and admin ID are required" });
      }
      
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Status must be either 'approved' or 'rejected'" });
      }
      
      const updatedRequest = await storage.processWithdrawalRequest(id, status, notes, admin_id);
      
      if (!updatedRequest) {
        return res.status(404).json({ message: "Withdrawal request not found" });
      }
      
      res.json({
        message: `Withdrawal request ${status}`,
        withdrawalRequest: updatedRequest,
      });
    } catch (error: any) {
      console.error("Error processing withdrawal request:", error);
      res.status(500).json({ message: error.message || "Failed to process withdrawal request" });
    }
  });

  // Brands API endpoints
  app.get(apiRouter("/brands"), async (_req: Request, res: Response) => {
    try {
      const brandsData = await storage.getBrands();
      res.json(brandsData);
    } catch (error: any) {
      console.error("Error fetching brands:", error);
      res.status(500).json({ message: error.message || "Failed to fetch brands" });
    }
  });
  
  app.get(apiRouter("/brands/:id"), async (req: Request, res: Response) => {
    try {
      const brandId = parseInt(req.params.id);
      if (isNaN(brandId)) {
        return res.status(400).json({ message: "Invalid brand ID" });
      }
      
      const brand = await storage.getBrand(brandId);
      if (!brand) {
        return res.status(404).json({ message: "Brand not found" });
      }
      
      res.json(brand);
    } catch (error: any) {
      console.error("Error fetching brand:", error);
      res.status(500).json({ message: error.message || "Failed to fetch brand" });
    }
  });
  
  app.post(apiRouter("/brands"), async (req: Request, res: Response) => {
    try {
      const { name, slug, logo } = req.body;
      
      if (!name || !slug) {
        return res.status(400).json({ message: "Name and slug are required" });
      }
      
      const brand = await storage.createBrand({ name, slug, logo });
      res.status(201).json(brand);
    } catch (error: any) {
      console.error("Error creating brand:", error);
      res.status(500).json({ message: error.message || "Failed to create brand" });
    }
  });
  
  app.put(apiRouter("/brands/:id"), async (req: Request, res: Response) => {
    try {
      const brandId = parseInt(req.params.id);
      if (isNaN(brandId)) {
        return res.status(400).json({ message: "Invalid brand ID" });
      }
      
      const { name, slug, logo } = req.body;
      
      if (!name || !slug) {
        return res.status(400).json({ message: "Name and slug are required" });
      }
      
      const updatedBrand = await storage.updateBrand(brandId, { name, slug, logo });
      
      if (!updatedBrand) {
        return res.status(404).json({ message: "Brand not found" });
      }
      
      res.json(updatedBrand);
    } catch (error: any) {
      console.error("Error updating brand:", error);
      res.status(500).json({ message: error.message || "Failed to update brand" });
    }
  });
  
  app.delete(apiRouter("/brands/:id"), async (req: Request, res: Response) => {
    try {
      const brandId = parseInt(req.params.id);
      if (isNaN(brandId)) {
        return res.status(400).json({ message: "Invalid brand ID" });
      }
      
      const result = await storage.deleteBrand(brandId);
      
      if (!result.success) {
        // If there's a specific error about dependencies, return 409 Conflict
        if (result.error && result.error.includes('associated')) {
          return res.status(409).json({ message: result.error });
        }
        // Otherwise assume not found or general error
        return res.status(404).json({ message: result.error || "Brand not found or could not be deleted" });
      }
      
      res.status(200).json({ message: "Brand deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting brand:", error);
      res.status(500).json({ message: error.message || "Failed to delete brand" });
    }
  });
  
  // Brand Device Types endpoints
  app.get(apiRouter("/brand-device-types"), async (_req: Request, res: Response) => {
    try {
      // Execute raw SQL query directly
      const relations = await db.execute(sql`
        SELECT 
          bdt.id, 
          bdt.brand_id, 
          bdt.device_type_id, 
          bdt.created_at, 
          bdt.updated_at,
          b.name as brand_name, 
          dt.name as device_type_name
        FROM brand_device_types bdt
        LEFT JOIN brands b ON bdt.brand_id = b.id
        LEFT JOIN device_types dt ON bdt.device_type_id = dt.id
      `);
      
      res.json(relations);
    } catch (error) {
      console.error("Error getting brand device types:", error);
      res.status(500).json({ message: "Failed to get brand device types" });
    }
  });
  
  app.get(apiRouter("/brand-device-types/:id"), async (req: Request, res: Response) => {
    try {
      const relation = await storage.getBrandDeviceType(Number(req.params.id));
      if (!relation) {
        return res.status(404).json({ message: "Brand device type relation not found" });
      }
      res.json(relation);
    } catch (error) {
      console.error("Error getting brand device type:", error);
      res.status(500).json({ message: "Failed to get brand device type" });
    }
  });
  
  app.post(apiRouter("/brand-device-types"), async (req: Request, res: Response) => {
    try {
      const { brand_id, device_type_id } = req.body;
      
      if (!brand_id || !device_type_id) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const newRelation = await storage.createBrandDeviceType({
        brand_id: Number(brand_id),
        device_type_id: Number(device_type_id)
      });
      
      res.status(201).json(newRelation);
    } catch (error) {
      console.error("Error creating brand device type:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create brand device type";
      res.status(500).json({ message: errorMessage });
    }
  });
  
  app.delete(apiRouter("/brand-device-types/:id"), async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteBrandDeviceType(Number(req.params.id));
      if (!deleted) {
        return res.status(404).json({ message: "Brand device type relation not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting brand device type:", error);
      res.status(500).json({ message: "Failed to delete brand device type" });
    }
  });
  
  app.get(apiRouter("/device-types/:id/brands"), async (req: Request, res: Response) => {
    try {
      const deviceTypeId = Number(req.params.id);
      const brands = await storage.getBrandForDeviceType(deviceTypeId);
      res.json(brands);
    } catch (error) {
      console.error("Error getting brands for device type:", error);
      res.status(500).json({ message: "Failed to get brands for device type" });
    }
  });

  // Device models API endpoint
  app.get(apiRouter("/device-models"), async (_req: Request, res: Response) => {
    try {
      const deviceModelsData = await storage.getDeviceModels();
      res.json(deviceModelsData);
    } catch (error: any) {
      console.error("Error fetching device models:", error);
      res.status(500).json({ message: error.message || "Failed to fetch device models" });
    }
  });
  
  // Create a new device model
  app.post(apiRouter("/device-models"), async (req: Request, res: Response) => {
    try {
      const modelData = req.body;
      
      // Validate required fields
      if (!modelData.name) {
        return res.status(400).json({ message: "Model name is required" });
      }
      
      if (!modelData.image) {
        return res.status(400).json({ message: "Model image is required" });
      }
      
      if (!modelData.brand_id) {
        return res.status(400).json({ message: "Brand is required" });
      }
      
      if (!modelData.device_type_id) {
        return res.status(400).json({ message: "Device type is required" });
      }
      
      // Generate slug if not provided
      if (!modelData.slug) {
        modelData.slug = modelData.name.toLowerCase().replace(/\s+/g, '-');
      }
      
      // Convert string IDs to numbers
      if (modelData.brand_id) modelData.brand_id = Number(modelData.brand_id);
      if (modelData.device_type_id) modelData.device_type_id = Number(modelData.device_type_id);
      
      // Handle variants as JSON string for PostgreSQL
      if (modelData.variants && Array.isArray(modelData.variants)) {
        modelData.variants = JSON.stringify(modelData.variants);
      }
      
      // Use direct SQL to create the model to avoid ORM field mapping issues
      const { pool } = await import('./db');
      
      const insertQuery = `
        INSERT INTO device_models (
          name, slug, image, brand_id, device_type_id, 
          active, featured, variants, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        ) RETURNING *
      `;
      
      const now = new Date();
      const insertValues = [
        modelData.name,
        modelData.slug,
        modelData.image,
        modelData.brand_id,
        modelData.device_type_id,
        modelData.active !== undefined ? modelData.active : true,
        modelData.featured !== undefined ? modelData.featured : false,
        modelData.variants || null,
        now,
        now
      ];
      
      console.log("Creating device model with values:", insertValues);
      const result = await pool.query(insertQuery, insertValues);
      
      if (!result.rows || result.rows.length === 0) {
        return res.status(500).json({ message: "Failed to create device model" });
      }
      
      res.status(201).json(result.rows[0]);
    } catch (error: any) {
      console.error("Error creating device model:", error);
      res.status(500).json({ message: error.message || "Failed to create device model" });
    }
  });
  
  // Get device model by ID
  app.get(apiRouter("/device-models/:id"), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const model = await storage.getDeviceModel(id);
      
      if (!model) {
        return res.status(404).json({ message: "Device model not found" });
      }
      
      res.json(model);
    } catch (error: any) {
      console.error("Error fetching device model:", error);
      res.status(500).json({ message: error.message || "Failed to fetch device model" });
    }
  });
  
  // Update device model with direct SQL to match the actual database structure
  app.put(apiRouter("/device-models/:id"), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const requestData = req.body;
      
      // Import and use the raw pool connection from db.ts
      const { pool } = await import('./db');
      
      // First check if the model exists using raw SQL to avoid ORM issues
      const checkModelQuery = `SELECT id FROM device_models WHERE id = $1`;
      const checkResult = await pool.query(checkModelQuery, [id]);
      
      if (!checkResult.rows || checkResult.rows.length === 0) {
        return res.status(404).json({ message: "Device model not found" });
      }
      
      // Prepare fields for the database using the actual column names
      const updateFields: Record<string, any> = {};
      if (requestData.name !== undefined) updateFields.name = requestData.name;
      if (requestData.slug !== undefined) updateFields.slug = requestData.slug;
      if (requestData.image !== undefined) updateFields.image = requestData.image;
      if (requestData.brand_id !== undefined) updateFields.brand_id = Number(requestData.brand_id);
      if (requestData.device_type_id !== undefined) updateFields.device_type_id = Number(requestData.device_type_id);
      if (requestData.active !== undefined) updateFields.active = requestData.active;
      if (requestData.featured !== undefined) updateFields.featured = requestData.featured;
      if (requestData.variants !== undefined) updateFields.variants = requestData.variants;
      
      // Always add updated_at timestamp
      updateFields.updated_at = new Date();
      
      // Handle arrays specially for PostgreSQL
      if (updateFields.variants && Array.isArray(updateFields.variants)) {
        updateFields.variants = JSON.stringify(updateFields.variants);
      }
      
      // Build parameterized update query
      const keys = Object.keys(updateFields);
      const placeholders = keys.map((_, i) => `$${i + 2}`);
      const setClauses = keys.map((key, i) => `${key} = $${i + 2}`);
      
      const updateQuery = `
        UPDATE device_models
        SET ${setClauses.join(', ')}
        WHERE id = $1
        RETURNING *
      `;
      
      // Create parameters array with id as first parameter
      const updateValues = [id];
      
      // Add all values in the correct order
      keys.forEach(key => {
        updateValues.push(updateFields[key]);
      });
      
      console.log("Update query:", updateQuery);
      console.log("Update values:", updateValues);
      
      // Use the same pool instance
      const result = await pool.query(updateQuery, updateValues);
      
      if (!result.rows || result.rows.length === 0) {
        return res.status(500).json({ message: "Failed to update device model" });
      }
      
      res.json(result.rows[0]);
    } catch (error: any) {
      console.error("Error updating device model:", error);
      res.status(500).json({ message: error.message || "Failed to update device model" });
    }
  });
  
  // Delete device model
  app.delete(apiRouter("/device-models/:id"), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const deleted = await storage.deleteDeviceModel(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Device model not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting device model:", error);
      res.status(500).json({ message: error.message || "Failed to delete device model" });
    }
  });

  // Q&A Management System - Question Groups API Endpoints
  app.get(apiRouter("/question-groups"), async (req: Request, res: Response) => {
    try {
      const deviceTypeId = req.query.device_type_id ? parseInt(req.query.device_type_id as string) : undefined;
      const groups = await db.select().from(questionGroups)
        .where(deviceTypeId ? eq(questionGroups.deviceTypeId, deviceTypeId) : undefined)
        .orderBy(asc(questionGroups.name));
      
      // Get question counts for each group using a more efficient approach
      const result = await Promise.all(groups.map(async (group) => {
        // Query to count questions for this group
        const countQuery = `
          SELECT COUNT(*) as count 
          FROM questions 
          WHERE group_id = $1
        `;
        const countResult = await pool.query(countQuery, [group.id]);
        const questionsCount = parseInt(countResult.rows[0].count);
        
        // Return enhanced group with count
        return {
          ...group,
          questionsCount: questionsCount
        };
      }));
      
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching question groups:", error);
      res.status(500).json({ message: error.message || "Failed to fetch question groups" });
    }
  });
  
  app.get(apiRouter("/question-groups/:id"), async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.id);
      const [group] = await db.select().from(questionGroups).where(eq(questionGroups.id, groupId));
      
      if (!group) {
        return res.status(404).json({ message: "Question group not found" });
      }
      
      // Get questions for this group
      const groupQuestions = await db.select().from(questions)
        .where(eq(questions.groupId, groupId))
        .orderBy(asc(questions.order));
      
      // Get answer choices for each question
      const enrichedQuestions = await Promise.all(
        groupQuestions.map(async (question) => {
          const choices = await db.select().from(answerChoices)
            .where(eq(answerChoices.questionId, question.id))
            .orderBy(asc(answerChoices.order));
          
          return {
            ...question,
            answerChoices: choices
          };
        })
      );
      
      res.json({
        ...group,
        questions: enrichedQuestions
      });
    } catch (error: any) {
      console.error("Error fetching question group:", error);
      res.status(500).json({ message: error.message || "Failed to fetch question group" });
    }
  });
  
  app.post(apiRouter("/question-groups"), async (req: Request, res: Response) => {
    try {
      const groupData = req.body;
      
      if (!groupData.name) {
        return res.status(400).json({ message: "Group name is required" });
      }
      
      if (!groupData.statement) {
        return res.status(400).json({ message: "Group statement is required" });
      }
      
      const [newGroup] = await db.insert(questionGroups)
        .values({
          name: groupData.name,
          statement: groupData.statement,
          deviceTypeId: groupData.deviceTypeId ? parseInt(groupData.deviceTypeId) : null,
          icon: groupData.icon,
          active: groupData.active !== undefined ? groupData.active : true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      res.status(201).json(newGroup);
    } catch (error: any) {
      console.error("Error creating question group:", error);
      res.status(500).json({ message: error.message || "Failed to create question group" });
    }
  });
  
  app.put(apiRouter("/question-groups/:id"), async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.id);
      const groupData = req.body;
      
      // Check if the group is mapped to any products
      const mappings = await db.select().from(productQuestionMappings)
        .where(eq(productQuestionMappings.groupId, groupId));
      
      // Update using direct SQL to avoid ORM mapping issues
      // First check if the column exists
      const columnCheckQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'question_groups' AND column_name = 'active'`;
      
      const columnCheck = await pool.query(columnCheckQuery);
      const hasActiveColumn = columnCheck.rows.length > 0;
      
      // Construct query based on whether 'active' column exists
      const query = hasActiveColumn ? `
        UPDATE question_groups 
        SET name = $1, 
            statement = $2, 
            device_type_id = $3,
            icon = $4,
            active = $5,
            updated_at = $6
        WHERE id = $7
        RETURNING *`
      : `
        UPDATE question_groups 
        SET name = $1, 
            statement = $2, 
            device_type_id = $3,
            icon = $4,
            updated_at = $5
        WHERE id = $6
        RETURNING *`;
      
      const values = hasActiveColumn ? [
        groupData.name,
        groupData.statement,
        groupData.deviceTypeId ? parseInt(groupData.deviceTypeId) : null,
        groupData.icon || null,
        groupData.active !== undefined ? groupData.active : true,
        new Date(),
        groupId
      ] : [
        groupData.name,
        groupData.statement,
        groupData.deviceTypeId ? parseInt(groupData.deviceTypeId) : null,
        groupData.icon || null,
        new Date(),
        groupId
      ];
      
      const result = await pool.query(query, values);
      const updatedGroup = result.rows[0];
      
      if (!updatedGroup) {
        return res.status(404).json({ message: "Question group not found" });
      }
      
      res.json({
        ...updatedGroup,
        isMapped: mappings.length > 0
      });
    } catch (error: any) {
      console.error("Error updating question group:", error);
      res.status(500).json({ message: error.message || "Failed to update question group" });
    }
  });
  
  app.delete(apiRouter("/question-groups/:id"), async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.id);
      console.log(`Attempting to delete question group with ID: ${groupId}`);
      
      // First check if the group is mapped to any products using raw SQL
      const mappingQuery = `
        SELECT id FROM product_question_mappings
        WHERE group_id = $1
      `;
      const mappingResult = await pool.query(mappingQuery, [groupId]);
      
      if (mappingResult.rows.length > 0) {
        return res.status(400).json({ 
          message: "Cannot delete question group because it is mapped to one or more products" 
        });
      }
      
      // Get all questions in this group using raw SQL
      const questionsQuery = `
        SELECT id FROM questions
        WHERE group_id = $1
      `;
      const questionsResult = await pool.query(questionsQuery, [groupId]);
      const questions = questionsResult.rows;
      
      console.log(`Found ${questions.length} questions to delete for group ID: ${groupId}`);
      
      // Delete all answer choices for all questions in this group
      for (const question of questions) {
        const deleteChoicesQuery = `
          DELETE FROM answer_choices 
          WHERE question_id = $1
        `;
        await pool.query(deleteChoicesQuery, [question.id]);
        console.log(`Deleted answer choices for question ID: ${question.id}`);
      }
      
      // Delete all questions in this group
      const deleteQuestionsQuery = `
        DELETE FROM questions
        WHERE group_id = $1
      `;
      await pool.query(deleteQuestionsQuery, [groupId]);
      console.log(`Deleted all questions for group ID: ${groupId}`);
      
      // Delete the question group itself
      const deleteGroupQuery = `
        DELETE FROM question_groups
        WHERE id = $1
        RETURNING *
      `;
      const result = await pool.query(deleteGroupQuery, [groupId]);
      
      if (result && result.rowCount > 0) {
        console.log(`Successfully deleted question group with ID: ${groupId}`);
        res.json({ message: "Question group deleted successfully" });
      } else {
        console.log(`Question group with ID: ${groupId} not found`);
        res.status(404).json({ message: "Question group not found" });
      }
    } catch (error: any) {
      console.error("Error deleting question group:", error);
      res.status(500).json({ message: error.message || "Failed to delete question group" });
    }
  });
  
  // Questions API Endpoints
  app.get(apiRouter("/questions"), async (req: Request, res: Response) => {
    try {
      const groupId = req.query.group_id ? parseInt(req.query.group_id as string) : undefined;
      
      const allQuestions = await db.select().from(questions)
        .where(groupId ? eq(questions.group_id, groupId) : undefined)
        .orderBy(asc(questions.order));
      
      res.json(allQuestions);
    } catch (error: any) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: error.message || "Failed to fetch questions" });
    }
  });
  
  app.get(apiRouter("/questions/:id"), async (req: Request, res: Response) => {
    try {
      const questionId = parseInt(req.params.id);
      const [question] = await db.select().from(questions).where(eq(questions.id, questionId));
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      const choices = await db.select().from(answerChoices)
        .where(eq(answerChoices.questionId, questionId))
        .orderBy(asc(answerChoices.order));
      
      res.json({
        ...question,
        answerChoices: choices
      });
    } catch (error: any) {
      console.error("Error fetching question:", error);
      res.status(500).json({ message: error.message || "Failed to fetch question" });
    }
  });
  
  app.post(apiRouter("/questions"), async (req: Request, res: Response) => {
    try {
      const questionData = req.body;
      
      if (!questionData.questionText) {
        return res.status(400).json({ message: "Question text is required" });
      }
      
      if (!questionData.groupId) {
        return res.status(400).json({ message: "Question group is required" });
      }
      
      const [newQuestion] = await db.insert(questions)
        .values({
          questionText: questionData.questionText,
          questionType: questionData.questionType || "single_choice",
          groupId: parseInt(questionData.groupId),
          order: questionData.order || 0,
          active: questionData.active !== undefined ? questionData.active : true,
          tooltip: questionData.tooltip,
          required: questionData.required !== undefined ? questionData.required : true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      // Create answer choices if provided
      if (questionData.answerChoices && Array.isArray(questionData.answerChoices) && questionData.answerChoices.length > 0) {
        // Log what's coming in from the frontend to debug
        console.log("Creating answer choices with data:", JSON.stringify(questionData.answerChoices));
        
        // Use direct SQL for inserting answer choices to avoid ORM mapping issues
        const insertResults = [];
        
        for (let i = 0; i < questionData.answerChoices.length; i++) {
          const choice = questionData.answerChoices[i];
          const textValue = choice.text || choice.answerText || choice.label || `Option ${i + 1}`;
          
          const insertQuery = `
            INSERT INTO answer_choices (
              question_id, text, answer_text, value, icon, impact, 
              weightage, repair_cost, is_default, "order", 
              created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
            ) RETURNING *
          `;
          
          const now = new Date();
          const insertValues = [
            newQuestion.id,
            textValue,                                           // text
            textValue,                                           // answer_text
            choice.value || String(i),                           // value
            choice.icon || null,                                 // icon
            choice.impact || choice.weightage || 0,              // impact
            choice.weightage || 0,                               // weightage
            choice.repairCost || 0,                              // repair_cost
            choice.isDefault || false,                           // is_default
            i,                                                  // order
            now,                                                // created_at
            now                                                 // updated_at
          ];
          
          const result = await pool.query(insertQuery, insertValues);
          if (result.rows && result.rows.length > 0) {
            insertResults.push(result.rows[0]);
          }
        }
        
        const choices = insertResults;
        
        res.status(201).json({
          ...newQuestion,
          answerChoices: choices
        });
      } else {
        res.status(201).json(newQuestion);
      }
    } catch (error: any) {
      console.error("Error creating question:", error);
      res.status(500).json({ message: error.message || "Failed to create question" });
    }
  });
  
  app.put(apiRouter("/questions/:id"), async (req: Request, res: Response) => {
    try {
      const questionId = parseInt(req.params.id);
      const questionData = req.body;
      
      // Update the question
      const [updatedQuestion] = await db.update(questions)
        .set({
          questionText: questionData.questionText,
          questionType: questionData.questionType,
          groupId: parseInt(questionData.groupId),
          order: questionData.order,
          active: questionData.active,
          tooltip: questionData.tooltip,
          required: questionData.required,
          updatedAt: new Date()
        })
        .where(eq(questions.id, questionId))
        .returning();
      
      if (!updatedQuestion) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      // Handle answer choices updates if provided
      if (questionData.answerChoices && Array.isArray(questionData.answerChoices)) {
        try {
          // Delete existing choices
          await db.delete(answerChoices)
            .where(eq(answerChoices.questionId, questionId));
          
          // Log the incoming choice data to debug
          console.log("Updating with answer choices:", JSON.stringify(questionData.answerChoices));
          
          // Use direct SQL for inserting answer choices to avoid ORM mapping issues
          if (questionData.answerChoices.length > 0) {
            const insertResults = [];
            
            for (let i = 0; i < questionData.answerChoices.length; i++) {
              const choice = questionData.answerChoices[i];
              const textValue = choice.text || choice.answerText || choice.label || `Option ${i + 1}`;
              
              const insertQuery = `
                INSERT INTO answer_choices (
                  question_id, text, answer_text, value, icon, impact, 
                  weightage, repair_cost, is_default, "order", 
                  created_at, updated_at
                ) VALUES (
                  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
                ) RETURNING *
              `;
              
              const now = new Date();
              const insertValues = [
                questionId,
                textValue,                                           // text
                textValue,                                           // answer_text
                choice.value || String(i),                           // value
                choice.icon || null,                                 // icon
                choice.impact || choice.weightage || 0,              // impact
                choice.weightage || 0,                               // weightage
                choice.repairCost || 0,                              // repair_cost
                choice.isDefault || false,                           // is_default
                i,                                                  // order
                now,                                                // created_at
                now                                                 // updated_at
              ];
              
              const result = await pool.query(insertQuery, insertValues);
              if (result.rows && result.rows.length > 0) {
                insertResults.push(result.rows[0]);
              }
            }
            
            res.json({
              ...updatedQuestion,
              answerChoices: insertResults
            });
          } else {
            res.json(updatedQuestion);
          }
        } catch (error: any) {
          console.error("Error updating answer choices:", error);
          res.status(500).json({ message: error.message || "Failed to update answer choices" });
        }
      } else {
        res.json(updatedQuestion);
      }
    } catch (error: any) {
      console.error("Error updating question:", error);
      res.status(500).json({ message: error.message || "Failed to update question" });
    }
  });
  
  app.delete(apiRouter("/questions/:id"), async (req: Request, res: Response) => {
    try {
      const questionId = parseInt(req.params.id);
      
      // Delete all answer choices for this question
      await db.delete(answerChoices)
        .where(eq(answerChoices.questionId, questionId));
      
      // Delete the question
      const result = await db.delete(questions)
        .where(eq(questions.id, questionId))
        .returning();
      
      if (!result.length) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      res.json({ message: "Question deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting question:", error);
      res.status(500).json({ message: error.message || "Failed to delete question" });
    }
  });
  
  // Product-Question Mappings API Endpoints
  app.get(apiRouter("/product-question-mappings"), async (req: Request, res: Response) => {
    try {
      const productId = req.query.productId ? parseInt(req.query.productId as string) : undefined;
      
      // Use direct SQL query to avoid column name mismatches
      console.log("Fetching product-question mappings...");
      
      // Build query based on whether a productId was provided
      let queryText = `
        SELECT 
          pqm.id, 
          pqm.product_id, 
          pqm.group_id, 
          pqm.question_id,
          pqm.required, 
          pqm.action_type,
          pqm.impact_multiplier,
          pqm.created_at, 
          pqm.updated_at,
          p.title as product_title,
          qg.name as group_name,
          q.question_text
        FROM product_question_mappings pqm
        LEFT JOIN products p ON pqm.product_id = p.id
        LEFT JOIN question_groups qg ON pqm.group_id = qg.id
        LEFT JOIN questions q ON pqm.question_id = q.id
      `;
      
      // Add WHERE clause if productId is provided
      const params = [];
      if (productId) {
        queryText += ` WHERE pqm.product_id = $1`;
        params.push(productId);
      }
      
      // Group by product for easier display
      queryText += ` ORDER BY pqm.product_id, qg.name`;
      
      // Execute the query
      const result = await pool.query(queryText, params);
      
      // Format the response
      const mappings = result.rows.map(row => ({
        id: row.id,
        productId: row.product_id,
        productTitle: row.product_title,
        groupId: row.group_id,
        groupName: row.group_name,
        questionId: row.question_id,
        questionText: row.question_text,
        required: row.required,
        actionType: row.action_type,
        impactMultiplier: row.impact_multiplier,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
      
      console.log(`Found ${mappings.length} product-question mappings`);
      res.json(mappings);
    } catch (error: any) {
      console.error("Error fetching product-question mappings:", error);
      res.status(500).json({ message: error.message || "Failed to fetch product-question mappings" });
    }
  });
  
  // Copy product question mappings between products
  app.post(apiRouter("/product-question-mappings/copy"), async (req: Request, res: Response) => {
    try {
      const { sourceProductId, targetProductId, mappings, overrides } = req.body;
      
      if (!sourceProductId || !targetProductId) {
        return res.status(400).json({ message: "Source and target product IDs are required" });
      }
      
      if (!mappings || !Array.isArray(mappings) || mappings.length === 0) {
        return res.status(400).json({ message: "At least one mapping must be selected for copying" });
      }
      
      // Track created/updated mappings
      const results = [];
      
      // Process each mapping
      for (const mapping of mappings) {
        // Check if a mapping with the same question group already exists for the target
        const existingMappings = await db.select().from(productQuestionMappings)
          .where(and(
            eq(productQuestionMappings.productId, targetProductId),
            eq(productQuestionMappings.groupId, mapping.groupId)
          ));
        
        // Get action type from mapping if available
        const actionType = mapping.actionType || null;
        
        if (existingMappings.length > 0) {
          // Update the existing mapping
          const [updatedMapping] = await db.update(productQuestionMappings)
            .set({
              required: true, // Default to required
              action_type: actionType,
              impact_multiplier: 1.0, // Default value
              updatedAt: new Date()
            })
            .where(eq(productQuestionMappings.id, existingMappings[0].id))
            .returning();
          
          results.push({ 
            id: updatedMapping.id, 
            action: 'updated', 
            groupId: mapping.groupId 
          });
        } else {
          // Create a new mapping
          const [newMapping] = await db.insert(productQuestionMappings)
            .values({
              product_id: targetProductId,
              group_id: mapping.groupId,
              action_type: actionType,
              required: true, // Default to required
              impact_multiplier: 1.0, // Default value
              createdAt: new Date(),
              updatedAt: new Date()
            })
            .returning();
          
          results.push({ 
            id: newMapping.id, 
            action: 'created', 
            questionId: mapping.questionId 
          });
        }
      }
      
      res.status(200).json({
        message: `Successfully copied ${results.length} questionnaire mappings`,
        results
      });
    } catch (error: any) {
      console.error("Error copying product-question mappings:", error);
      res.status(500).json({ message: error.message || "Failed to copy product-question mappings" });
    }
  });
  
  // DELETE endpoint for product-question mappings
  app.delete(apiRouter("/product-question-mappings/:id"), async (req: Request, res: Response) => {
    try {
      const mappingId = parseInt(req.params.id);
      
      // Use direct SQL to delete the mapping
      const result = await pool.query(
        `DELETE FROM product_question_mappings WHERE id = $1 RETURNING *`,
        [mappingId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Product-question mapping not found" });
      }
      
      res.json({ message: "Product-question mapping deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting product-question mapping:", error);
      res.status(500).json({ message: error.message || "Failed to delete product-question mapping" });
    }
  });
  
  // Create a product-question mapping  
  app.post(apiRouter("/product-question-mappings"), async (req: Request, res: Response) => {
    try {
      console.log("Received mapping data:", req.body);
      const mappingData = req.body;
      
      if (!mappingData.productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }
      
      if (!mappingData.groupId) {
        return res.status(400).json({ message: "Question Group ID is required" });
      }
      
      console.log("Creating mapping between product ID:", mappingData.productId, "and group ID:", mappingData.groupId);
      
      // Get connection to database using the pool from db.ts to ensure proper connection
      try {
        console.log("Executing direct SQL query to create mapping");
        
        // Check if the database has the columns we expect
        const checkTableQuery = await pool.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'product_question_mappings'
        `);
        
        console.log("Table columns:", checkTableQuery.rows);
        
        // Check if mapping already exists using prepared statement
        const checkExisting = await pool.query(
          'SELECT * FROM product_question_mappings WHERE product_id = $1 AND group_id = $2',
          [parseInt(mappingData.productId), parseInt(mappingData.groupId)]
        );
        
        if (checkExisting.rows.length > 0) {
          console.log("Mapping already exists");
          return res.status(400).json({ message: "This product-question group mapping already exists" });
        }
        
        // Get action type from request if available
        const actionType = mappingData.actionType || null;
        console.log("Using action type:", actionType);
        
        // Get the first question from the group to use as the required question_id
        const groupQuestions = await pool.query(
          'SELECT id FROM questions WHERE group_id = $1 LIMIT 1',
          [parseInt(mappingData.groupId)]
        );
        
        let questionId = null;
        if (groupQuestions.rows.length > 0) {
          questionId = groupQuestions.rows[0].id;
          console.log("Found question ID from group:", questionId);
        } else {
          // Create a dummy question to satisfy the constraint if no questions exist in the group
          console.log("No questions found in the group, creating a placeholder question ID");
          const dummyQuestion = await pool.query(
            `INSERT INTO questions 
            (question_text, question_type, group_id, active, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING id`,
            ["Group placeholder question", "single_choice", parseInt(mappingData.groupId), true, new Date(), new Date()]
          );
          questionId = dummyQuestion.rows[0].id;
        }

        // Insert new mapping with prepared statement, including the question_id
        const result = await pool.query(
          `INSERT INTO product_question_mappings
              (product_id, group_id, question_id, action_type, required, impact_multiplier, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *`,
          [
            parseInt(mappingData.productId),
            parseInt(mappingData.groupId),
            questionId,
            actionType,
            true,
            1.0,
            new Date(),
            new Date()
          ]
        );
        
        console.log("Mapping created successfully:", result.rows[0]);
        res.status(201).json(result.rows[0]);
      } catch (error: any) {
        console.error("Database error details:", error);
        
        // Check if error relates to missing columns or constraints
        if (error.code === '42703') {
          console.error("Column does not exist in table. Available columns listed above.");
        } else if (error.code === '23503') {
          console.error("Foreign key constraint failed. Check that product_id and group_id exist in their respective tables.");
        }
        
        throw error;
      }
    } catch (error: any) {
      console.error("Error creating product-question mapping:", error);
      res.status(500).json({ 
        message: "Failed to create product-question mapping", 
        error: error.message,
        code: error.code
      });
    }
  });
  
  // Legacy condition questions API endpoint
  // Define interfaces for condition questions and options
  interface ConditionOption {
    id: number;
    text?: string;
    answer?: string;
    value: string | number;
  }
  
  interface ConditionQuestion {
    id: number;
    question: string;
    deviceTypeId: number;
    order: number;
    active: boolean;
    options: ConditionOption[];
  }
  
  // Get condition questions by device type ID
  app.get(apiRouter("/condition-questions"), async (req: Request, res: Response) => {
    try {
      const deviceTypeId = req.query.deviceTypeId ? Number(req.query.deviceTypeId) : undefined;
      const modelId = req.query.modelId ? Number(req.query.modelId) : undefined;
      
      let questionsData: ConditionQuestion[] = [];
      
      if (modelId) {
        // If modelId is provided, use the product mapping to get questions
        try {
          console.log(`Fetching questions for device model ID: ${modelId}`);
          
          // Products have a direct device_model_id column we can use
          const productResult = await pool.query(
            `SELECT id, title FROM products WHERE device_model_id = $1`,
            [modelId]
          );
          
          // If no direct match, try to find by name
          if (productResult.rows.length === 0) {
            console.log(`No direct product mapping for model ID: ${modelId}, trying to find by name`);
            
            const modelResult = await pool.query(
              `SELECT name FROM device_models WHERE id = $1`,
              [modelId]
            );
            
            if (modelResult.rows.length === 0) {
              console.log(`No device model found with ID: ${modelId}`);
              res.json([]);
              return;
            }
            
            const modelName = modelResult.rows[0].name;
            console.log(`Found device model name: ${modelName}`);
            
            // Find product by matching the title (which usually contains model name)
            const titleProductResult = await pool.query(
              `SELECT id, title FROM products WHERE title LIKE $1`,
              [`%${modelName}%`]
            );
            
            if (titleProductResult.rows.length > 0) {
              console.log(`Found products by title match: ${titleProductResult.rows.map(r => r.title).join(', ')}`);
              // Override original empty result with these matches
              productResult.rows = titleProductResult.rows;
            }
          }
          
          if (productResult.rows.length === 0) {
            console.log(`No product found for model ID: ${modelId}, creating one automatically`);
            
            // Get the device model details to create a matching product
            const modelDetailsResult = await pool.query(
              `SELECT m.id, m.name, m.slug, m.brand_id, m.device_type_id, b.name as brand_name
               FROM device_models m
               JOIN brands b ON m.brand_id = b.id
               WHERE m.id = $1`,
              [modelId]
            );
            
            if (modelDetailsResult.rows.length === 0) {
              console.log(`Cannot find device model details for ID: ${modelId}`);
              res.json([]);
              return;
            }
            
            const modelDetails = modelDetailsResult.rows[0];
            
            // Create a product for this device model
            const newProductResult = await pool.query(
              `INSERT INTO products (
                title, 
                slug, 
                description, 
                price, 
                status, 
                is_physical, 
                requires_shipping,
                device_model_id,
                created_at, 
                updated_at
              ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
              ) RETURNING id, title`,
              [
                modelDetails.name, 
                modelDetails.slug, 
                `${modelDetails.brand_name} ${modelDetails.name}`, 
                0, 
                'active', 
                true, 
                true,
                modelId,
                new Date(), 
                new Date()
              ]
            );
            
            if (newProductResult.rows.length > 0) {
              console.log(`Created new product: ${newProductResult.rows[0].title} with ID: ${newProductResult.rows[0].id}`);
              productResult.rows = newProductResult.rows;
            } else {
              console.log(`Failed to create product for model ID: ${modelId}`);
              res.json([]);
              return;
            }
          }
          
          const productId = productResult.rows[0].id;
          console.log(`Found product ID: ${productId} for model ID: ${modelId}`);
          
          // Get all question groups mapped to this product
          const mappingsResult = await pool.query(
            `SELECT DISTINCT m.group_id 
             FROM product_question_mappings m 
             WHERE m.product_id = $1`,
            [productId]
          );
          
          if (mappingsResult.rows.length === 0) {
            console.log(`No question groups mapped to product ID: ${productId}`);
            res.json([]);
            return;
          }
          
          const groupIds = mappingsResult.rows.map(row => row.group_id);
          console.log(`Found question group IDs: ${groupIds.join(', ')}`);
          
          // Get all questions from these groups
          const questionsResult = await pool.query(
            `SELECT q.id, q.question_text as question, q.device_type_id as "deviceTypeId", 
                    q.order_index as "order", q.active
             FROM questions q
             WHERE q.group_id IN (${groupIds.map((_, i) => `$${i + 1}`).join(',')})
             ORDER BY q.order_index`,
            groupIds
          );
          
          console.log(`Found ${questionsResult.rows.length} questions from mapped groups`);
          
          // For each question, get its answer options
          const questions = await Promise.all(questionsResult.rows.map(async (question) => {
            const optionsResult = await pool.query(
              `SELECT id, answer_text as text, value
               FROM answer_choices
               WHERE question_id = $1
               ORDER BY id`,
              [question.id]
            );
            
            return {
              ...question,
              options: optionsResult.rows
            };
          }));
          
          questionsData = questions;
        } catch (error) {
          console.error("Error fetching mapped questions:", error);
          // Fall back to device type questions if there's an error
          questionsData = await storage.getConditionQuestions(deviceTypeId) as ConditionQuestion[];
        }
      } else {
        // Fall back to legacy behavior if no modelId is provided
        questionsData = await storage.getConditionQuestions(deviceTypeId) as ConditionQuestion[];
      }
      
      // Format questions to match the frontend expected format
      const formattedQuestions = questionsData.map(question => ({
        id: question.id.toString(),
        question: question.question,
        device_type_id: question.deviceTypeId,
        // Add a default tooltip instead of looking for it in the database
        tooltip: "Answer accurately to get the best price estimate.",
        order: question.order,
        active: question.active,
        multiSelect: false, // Default to false
        options: question.options.map((option: ConditionOption) => ({
          id: option.id.toString(),
          label: option.text || option.answer,
          value: option.value
        }))
      }));
      
      res.json(formattedQuestions);
    } catch (error: any) {
      console.error("Error fetching condition questions:", error);
      res.status(500).json({ message: error.message || "Failed to fetch condition questions" });
    }
  });
  
  // Get single condition question by ID
  app.get(apiRouter("/condition-questions/:id"), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const question = await storage.getConditionQuestion(id);
      
      if (!question) {
        return res.status(404).json({ message: "Condition question not found" });
      }
      
      // Format question to match the frontend expected format
      const formattedQuestion = {
        id: question.id.toString(),
        question: question.question,
        device_type_id: question.deviceTypeId,
        tooltip: "Answer accurately to get the best price estimate.",
        order: question.order,
        active: question.active,
        options: question.options.map((option: ConditionOption) => ({
          id: option.id.toString(),
          text: option.text || option.answer,
          value: option.value
        }))
      };
      
      res.json(formattedQuestion);
    } catch (error: any) {
      console.error("Error fetching condition question:", error);
      res.status(500).json({ message: error.message || "Failed to fetch condition question" });
    }
  });
  
  // Create condition question
  app.post(apiRouter("/condition-questions"), async (req: Request, res: Response) => {
    try {
      console.log("Creating condition question:", req.body);
      // Extract question data and options
      const { options, ...questionData } = req.body;
      
      // Convert device_type_id to deviceTypeId
      let deviceTypeId = questionData.device_type_id || questionData.deviceTypeId;
      // Ensure we have a valid number
      if (deviceTypeId) {
        deviceTypeId = parseInt(deviceTypeId, 10);
        if (isNaN(deviceTypeId)) {
          deviceTypeId = 1; // Default to first device type if invalid
        }
      } else {
        deviceTypeId = 1; // Default to first device type if missing
      }
      
      const formattedQuestionData = {
        ...questionData,
        deviceTypeId: deviceTypeId,
      };
      
      delete formattedQuestionData.device_type_id;
      
      // Create the condition question
      const question = await storage.createConditionQuestion(formattedQuestionData);
      
      // Add options for the question
      if (options && options.length > 0) {
        for (const option of options) {
          await storage.createConditionAnswer({
            question_id: question.id,
            text: option.text || option.value || 'Option', // Ensure text is not null
            value: option.value || '0' // Ensure value is not null
          });
        }
      }
      
      // Get the full question with options
      const completeQuestion = await storage.getConditionQuestion(question.id);
      
      // Format the response
      const formattedQuestion = {
        id: completeQuestion.id.toString(),
        question: completeQuestion.question,
        device_type_id: completeQuestion.deviceTypeId,
        tooltip: completeQuestion.tooltip || `Answer accurately to get the best price estimate.`,
        order: completeQuestion.order,
        active: completeQuestion.active,
        options: completeQuestion.options.map((option: ConditionOption) => ({
          id: option.id.toString(),
          text: option.text || option.answer,
          value: option.value
        }))
      };
      
      res.status(201).json(formattedQuestion);
    } catch (error: any) {
      console.error("Error creating condition question:", error);
      res.status(error.status || 500).json({ message: error.message || "Failed to create condition question" });
    }
  });
  
  // Update condition question
  app.put(apiRouter("/condition-questions/:id"), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { options, ...questionData } = req.body;
      
      // Convert device_type_id to deviceTypeId if present
      const formattedQuestionData: any = { ...questionData };
      
      // Handle deviceTypeId from either source
      let deviceTypeId = questionData.device_type_id || questionData.deviceTypeId;
      if (deviceTypeId !== undefined) {
        deviceTypeId = parseInt(deviceTypeId.toString(), 10);
        if (isNaN(deviceTypeId)) {
          deviceTypeId = 1; // Default to first device type if invalid
        }
        formattedQuestionData.deviceTypeId = deviceTypeId;
      }
      
      // Clean up the extra field if it exists
      if (formattedQuestionData.device_type_id) {
        delete formattedQuestionData.device_type_id;
      }
      
      // Update the question
      const updatedQuestion = await storage.updateConditionQuestion(id, formattedQuestionData);
      
      if (!updatedQuestion) {
        return res.status(404).json({ message: "Condition question not found" });
      }
      
      // If options are provided, update them
      if (options) {
        // First, delete existing options
        await storage.deleteConditionAnswersByQuestionId(id);
        
        // Then, create new options
        for (const option of options) {
          await storage.createConditionAnswer({
            question_id: id,
            text: option.text || option.value || 'Option', // Ensure text is not null
            value: option.value || '0' // Ensure value is not null
          });
        }
      }
      
      // Get the updated question with options
      const completeQuestion = await storage.getConditionQuestion(id);
      
      // Format the response
      const formattedQuestion = {
        id: completeQuestion.id.toString(),
        question: completeQuestion.question,
        device_type_id: completeQuestion.deviceTypeId,
        tooltip: completeQuestion.tooltip || `Answer accurately to get the best price estimate.`,
        order: completeQuestion.order,
        active: completeQuestion.active,
        options: completeQuestion.options.map((option: ConditionOption) => ({
          id: option.id.toString(),
          text: option.text || option.answer,
          value: option.value
        }))
      };
      
      res.json(formattedQuestion);
    } catch (error: any) {
      console.error("Error updating condition question:", error);
      res.status(error.status || 500).json({ message: error.message || "Failed to update condition question" });
    }
  });
  
  // Delete condition question
  app.delete(apiRouter("/condition-questions/:id"), async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      // Delete all associated options first
      await storage.deleteConditionAnswersByQuestionId(id);
      
      // Then delete the question
      const deleted = await storage.deleteConditionQuestion(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Condition question not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting condition question:", error);
      res.status(500).json({ message: error.message || "Failed to delete condition question" });
    }
  });
  
  // Get all condition answers
  app.get(apiRouter("/condition-answers"), async (req: Request, res: Response) => {
    try {
      const answers = await storage.getConditionAnswers();
      res.json(answers);
    } catch (error: any) {
      console.error("Error fetching condition answers:", error);
      res.status(500).json({ message: error.message || "Failed to fetch condition answers" });
    }
  });

  // Valuations API endpoint
  app.get(apiRouter("/valuations"), async (req: Request, res: Response) => {
    try {
      const deviceModelId = req.query.deviceModelId ? Number(req.query.deviceModelId) : undefined;
      const variant = req.query.variant as string | undefined;
      
      const valuationsData = await storage.getValuations(deviceModelId);
      
      // If we have a device model ID and variant, we can create a more focused response
      if (deviceModelId) {
        const modelValuations = valuationsData.filter(v => v.device_model_id === deviceModelId);
        
        // If there are no valuations for this model, create default ones
        if (modelValuations.length === 0) {
          // Create default valuations based on device model
          const deviceModels = await storage.getDeviceModels();
          const model = deviceModels.find(m => m.id === deviceModelId);
          
          if (model) {
            // Base price depends on the model - we'll create a reasonable placeholder
            const basePrice = 1000; // Default base price 
            
            // Generate valuations for default conditions
            const defaultValuations = [
              {
                id: 0,
                device_model_id: deviceModelId,
                variant: variant || null,
                condition_multiplier: 1.0, // Excellent condition
                base_price: basePrice,
                active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deviceModel: model
              },
              {
                id: 0,
                device_model_id: deviceModelId,
                variant: variant || null,
                condition_multiplier: 0.8, // Good condition
                base_price: basePrice * 0.8,
                active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deviceModel: model
              },
              {
                id: 0,
                device_model_id: deviceModelId,
                variant: variant || null,
                condition_multiplier: 0.6, // Fair condition
                base_price: basePrice * 0.6,
                active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deviceModel: model
              }
            ];
            
            return res.json(defaultValuations);
          }
        }
        
        // If we have valuations for this model but no variant specified, return all
        if (!variant) {
          return res.json(modelValuations);
        }
        
        // If we have a variant, filter for that variant
        const variantValuations = modelValuations.filter(v => 
          v.variant === variant || v.variant === null || v.variant === undefined
        );
        
        if (variantValuations.length > 0) {
          return res.json(variantValuations);
        }
        
        // If no valuations for this variant, use the base model valuations
        const baseValuations = modelValuations.filter(v => 
          v.variant === null || v.variant === undefined
        );
        
        if (baseValuations.length > 0) {
          // Adjust the base valuations to include the variant
          const adjustedValuations = baseValuations.map(v => ({
            ...v,
            variant
          }));
          
          return res.json(adjustedValuations);
        }
      }
      
      // Default case: return all valuations
      res.json(valuationsData);
    } catch (error: any) {
      console.error("Error fetching valuations:", error);
      res.status(500).json({ message: error.message || "Failed to fetch valuations" });
    }
  });

  // User endpoints
  app.post(apiRouter("/users"), async (req: Request, res: Response) => {
    try {
      const userData = validateRequest<InsertUser>(insertUserSchema, req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || "Failed to create user" });
    }
  });

  app.get(apiRouter("/users"), async (req: Request, res: Response) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const users = await storage.getUsers(page, limit);
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  app.get(apiRouter("/users/:id"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.put(apiRouter("/users/:id"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userData = validateRequest<Partial<InsertUser>>(insertUserSchema.partial(), req.body);
      const updatedUser = await storage.updateUser(id, userData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updatedUser);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || "Failed to update user" });
    }
  });

  app.delete(apiRouter("/users/:id"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(204).end();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  
  app.get(apiRouter("/users/count"), async (_req: Request, res: Response) => {
    try {
      // Get real counts from database
      const userCount = await storage.getUsersCount();
      const deviceCount = await storage.getDevicesCount();
      const orderCount = await storage.getOrdersCount();
      
      res.json({
        count: userCount,
        deviceCount: deviceCount,
        orderCount: orderCount
      });
    } catch (error: any) {
      console.error("Error fetching user counts:", error);
      res.status(500).json({ message: "Failed to get user count" });
    }
  });

  // Device endpoints
  app.post(apiRouter("/devices"), async (req: Request, res: Response) => {
    try {
      const deviceData = validateRequest<InsertDevice>(insertDeviceSchema, req.body);
      const device = await storage.createDevice(deviceData);
      res.status(201).json(device);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || "Failed to create device" });
    }
  });

  app.get(apiRouter("/devices"), async (req: Request, res: Response) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const status = req.query.status as string | undefined;
      const devices = await storage.getDevices(page, limit, status);
      res.json(devices);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get devices" });
    }
  });

  app.get(apiRouter("/devices/:id"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const device = await storage.getDevice(id);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      res.json(device);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get device" });
    }
  });

  app.put(apiRouter("/devices/:id"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deviceData = validateRequest<Partial<InsertDevice>>(insertDeviceSchema.partial(), req.body);
      const updatedDevice = await storage.updateDevice(id, deviceData);
      if (!updatedDevice) {
        return res.status(404).json({ message: "Device not found" });
      }
      res.json(updatedDevice);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || "Failed to update device" });
    }
  });

  app.delete(apiRouter("/devices/:id"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDevice(id);
      if (!success) {
        return res.status(404).json({ message: "Device not found" });
      }
      res.status(204).end();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete device" });
    }
  });

  app.get(apiRouter("/devices/seller/:sellerId"), async (req: Request, res: Response) => {
    try {
      const sellerId = parseInt(req.params.sellerId);
      const devices = await storage.getDevicesBySeller(sellerId);
      res.json(devices);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get devices by seller" });
    }
  });

  // Device images endpoints
  app.get(apiRouter("/devices/:deviceId/images"), async (req: Request, res: Response) => {
    try {
      const deviceId = parseInt(req.params.deviceId);
      const images = await storage.getDeviceImages(deviceId);
      res.json(images);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get device images" });
    }
  });

  app.post(apiRouter("/device-images"), async (req: Request, res: Response) => {
    try {
      const imageData = req.body;
      const image = await storage.createDeviceImage(imageData);
      res.status(201).json(image);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to create device image" });
    }
  });

  app.put(apiRouter("/devices/:deviceId/primary-image/:imageId"), async (req: Request, res: Response) => {
    try {
      const deviceId = parseInt(req.params.deviceId);
      const imageId = parseInt(req.params.imageId);
      const success = await storage.setDevicePrimaryImage(deviceId, imageId);
      if (!success) {
        return res.status(404).json({ message: "Device or image not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to set primary image" });
    }
  });

  app.delete(apiRouter("/device-images/:id"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDeviceImage(id);
      if (!success) {
        return res.status(404).json({ message: "Image not found" });
      }
      res.status(204).end();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete device image" });
    }
  });

  // Buyback request endpoints
  app.post(apiRouter("/buyback-requests"), async (req: Request, res: Response) => {
    try {
      console.log("Buyback request data:", req.body);
      const requestData = validateRequest<InsertBuybackRequest>(insertBuybackRequestSchema, req.body);
      const request = await storage.createBuybackRequest(requestData);
      res.status(201).json(request);
    } catch (error: any) {
      console.error("Buyback request validation error:", error);
      res.status(error.status || 500).json({ message: error.message || "Failed to create buyback request" });
    }
  });

  app.get(apiRouter("/buyback-requests"), async (req: Request, res: Response) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const status = req.query.status as string | undefined;
      
      // Get buyback requests from the database
      const buybackRequests = await storage.getBuybackRequests(page, limit, status);
      
      // If there are no buyback requests in the database yet and we're not filtering by status,
      // seed the database with one sample request
      if (buybackRequests.length === 0 && !status) {
        try {
          // Check if database is actually empty
          const totalCount = await storage.getBuybackRequestsCount();
          
          if (totalCount === 0) {
            console.log("No buyback requests found, creating sample data");
            
            // Create a sample buyback request
            const sampleRequest: InsertBuybackRequest = {
              userId: 1,
              deviceType: "Phone",
              manufacturer: "Apple",
              model: "iPhone 13 Pro",
              condition: "Good",
              status: "pending",
              questionnaireAnswers: {
                "Screen Condition": "No cracks, light scratches",
                "Battery Health": "85%",
                "Functions Properly": "Yes",
                "Water Damage": "No"
              },
              imei: "123456789012345",
              estimatedValue: "450.00"
            };
            
            await storage.createBuybackRequest(sampleRequest);
            
            // Fetch the newly created data
            return res.json(await storage.getBuybackRequests(page, limit, status));
          }
        } catch (seedError) {
          console.error("Error seeding initial buyback request data:", seedError);
          // Continue with empty results if seeding fails
        }
      }
      
      res.json(buybackRequests);
    } catch (error: any) {
      console.error("Error fetching buyback requests:", error);
      res.status(500).json({ message: "Failed to get buyback requests" });
    }
  });

  app.get(apiRouter("/buyback-requests/:id"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const request = await storage.getBuybackRequest(id);
      if (!request) {
        return res.status(404).json({ message: "Buyback request not found" });
      }
      res.json(request);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get buyback request" });
    }
  });

  app.get(apiRouter("/buyback-requests/user/:userId"), async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const requests = await storage.getBuybackRequestsByUser(userId);
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get buyback requests by user" });
    }
  });

  app.put(apiRouter("/buyback-requests/:id"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const requestData = validateRequest<Partial<InsertBuybackRequest>>(insertBuybackRequestSchema.partial(), req.body);
      const updatedRequest = await storage.updateBuybackRequest(id, requestData);
      if (!updatedRequest) {
        return res.status(404).json({ message: "Buyback request not found" });
      }
      res.json(updatedRequest);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || "Failed to update buyback request" });
    }
  });

  app.delete(apiRouter("/buyback-requests/:id"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBuybackRequest(id);
      if (!success) {
        return res.status(404).json({ message: "Buyback request not found" });
      }
      res.status(204).end();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete buyback request" });
    }
  });
  
  app.get(apiRouter("/buyback-requests/count"), async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string | undefined;
      const count = await storage.getBuybackRequestsCount(status);
      res.json({ count });
    } catch (error: any) {
      console.error("Error fetching buyback requests count:", error);
      res.status(500).json({ message: "Failed to get buyback requests count" });
    }
  });
  
  app.get(apiRouter("/buyback-requests/recent"), async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      // Get recent buyback requests from database
      const recentRequests = await storage.getRecentBuybackRequests(limit);
      
      res.json(recentRequests);
    } catch (error: any) {
      console.error("Error getting recent buyback requests:", error);
      res.status(500).json({ message: "Failed to get recent buyback requests" });
    }
  });

  // Marketplace listing endpoints
  app.post(apiRouter("/marketplace-listings"), async (req: Request, res: Response) => {
    try {
      const listingData = validateRequest<InsertMarketplaceListing>(insertMarketplaceListingSchema, req.body);
      const listing = await storage.createMarketplaceListing(listingData);
      res.status(201).json(listing);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || "Failed to create marketplace listing" });
    }
  });

  app.get(apiRouter("/marketplace-listings"), async (req: Request, res: Response) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const status = req.query.status as string | undefined;
      const listings = await storage.getMarketplaceListings(page, limit, status);
      res.json(listings);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get marketplace listings" });
    }
  });

  app.get(apiRouter("/marketplace-listings/:id"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const listing = await storage.getMarketplaceListing(id);
      if (!listing) {
        return res.status(404).json({ message: "Marketplace listing not found" });
      }
      res.json(listing);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get marketplace listing" });
    }
  });

  app.put(apiRouter("/marketplace-listings/:id"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const listingData = validateRequest<Partial<InsertMarketplaceListing>>(insertMarketplaceListingSchema.partial(), req.body);
      const updatedListing = await storage.updateMarketplaceListing(id, listingData);
      if (!updatedListing) {
        return res.status(404).json({ message: "Marketplace listing not found" });
      }
      res.json(updatedListing);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || "Failed to update marketplace listing" });
    }
  });

  app.delete(apiRouter("/marketplace-listings/:id"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMarketplaceListing(id);
      if (!success) {
        return res.status(404).json({ message: "Marketplace listing not found" });
      }
      res.status(204).end();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete marketplace listing" });
    }
  });

  // Order endpoints
  app.post(apiRouter("/orders"), async (req: Request, res: Response) => {
    try {
      const orderData = validateRequest<InsertOrder>(insertOrderSchema, req.body);
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || "Failed to create order" });
    }
  });

  app.get(apiRouter("/orders"), async (req: Request, res: Response) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const status = req.query.status as string | undefined;
      const orders = await storage.getOrders(page, limit, status);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get orders" });
    }
  });

  app.get(apiRouter("/orders/:id"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get order" });
    }
  });

  app.get(apiRouter("/orders/buyer/:buyerId"), async (req: Request, res: Response) => {
    try {
      const buyerId = parseInt(req.params.buyerId);
      const orders = await storage.getOrdersByBuyer(buyerId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get orders by buyer" });
    }
  });

  app.get(apiRouter("/orders/seller/:sellerId"), async (req: Request, res: Response) => {
    try {
      const sellerId = parseInt(req.params.sellerId);
      const orders = await storage.getOrdersBySeller(sellerId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get orders by seller" });
    }
  });

  app.put(apiRouter("/orders/:id"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const orderData = validateRequest<Partial<InsertOrder>>(insertOrderSchema.partial(), req.body);
      const updatedOrder = await storage.updateOrder(id, orderData);
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(updatedOrder);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || "Failed to update order" });
    }
  });

  app.delete(apiRouter("/orders/:id"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteOrder(id);
      if (!success) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.status(204).end();
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete order" });
    }
  });
  
  app.get(apiRouter("/orders/count"), async (_req: Request, res: Response) => {
    try {
      const count = await storage.getOrdersCount();
      res.json({ count });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get orders count" });
    }
  });
  
  app.get(apiRouter("/orders/recent"), async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      // Get recent orders from database
      const recentOrders = await storage.getRecentOrders(limit);
      
      res.json(recentOrders);
    } catch (error: any) {
      console.error("Error getting recent orders:", error);
      res.status(500).json({ message: "Failed to get recent orders" });
    }
  });
  
  // Settings API endpoints
  app.get(apiRouter("/settings"), async (req: Request, res: Response) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get settings" });
    }
  });
  
  app.put(apiRouter("/settings"), async (req: Request, res: Response) => {
    try {
      const settingsData = req.body;
      
      // Update settings in the database
      const updatedSettings = await storage.updateSettings(settingsData);
      
      // Return success response with the updated settings
      res.json({ 
        success: true, 
        message: "Settings updated successfully",
        data: updatedSettings
      });
    } catch (error: any) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings: " + error.message });
    }
  });
  
  // API endpoint for valuations
  app.post(apiRouter("/valuations"), async (req: Request, res: Response) => {
    try {
      const valuationData = req.body;
      
      // Create the valuation in the database
      const newValuation = await storage.createValuation(valuationData);
      
      res.status(201).json(newValuation);
    } catch (error: any) {
      console.error("Error creating valuation:", error);
      res.status(500).json({ message: error.message || "Failed to create valuation" });
    }
  });
  
  // Update a specific valuation by ID
  app.put(apiRouter("/valuations/:id"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const valuationData = req.body;
      
      const updatedValuation = await storage.updateValuation(id, valuationData);
      
      if (!updatedValuation) {
        return res.status(404).json({ message: "Valuation not found" });
      }
      
      res.json(updatedValuation);
    } catch (error: any) {
      console.error("Error updating valuation:", error);
      res.status(500).json({ message: error.message || "Failed to update valuation" });
    }
  });
  
  // Delete a specific valuation by ID
  app.delete(apiRouter("/valuations/:id"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      const success = await storage.deleteValuation(id);
      
      if (!success) {
        return res.status(404).json({ message: "Valuation not found" });
      }
      
      res.json({ success });
    } catch (error: any) {
      console.error("Error deleting valuation:", error);
      res.status(500).json({ message: error.message || "Failed to delete valuation" });
    }
  });
  
  // Delete all valuations for a specific model
  app.delete(apiRouter("/valuations/model/:modelId"), async (req: Request, res: Response) => {
    try {
      const modelId = parseInt(req.params.modelId);
      
      // Delete all valuations for this model from the database
      const success = await storage.deleteValuationsByModel(modelId);
      
      res.json({ success });
    } catch (error: any) {
      console.error("Error deleting valuations:", error);
      res.status(500).json({ message: error.message || "Failed to delete valuations" });
    }
  });

  // REGION MANAGEMENT API ENDPOINTS
  app.get(apiRouter("/regions"), async (req: Request, res: Response) => {
    try {
      // Mock regions data
      const regions = [
        { id: 1, name: 'North America', code: 'NA' },
        { id: 2, name: 'Europe', code: 'EU' },
        { id: 3, name: 'Asia Pacific', code: 'APAC' },
        { id: 4, name: 'Latin America', code: 'LATAM' },
        { id: 5, name: 'Middle East & Africa', code: 'MEA' }
      ];
      res.json(regions);
    } catch (error: any) {
      console.error('Error fetching regions:', error);
      res.status(500).json({ message: error.message || 'Failed to fetch regions' });
    }
  });

  app.get(apiRouter("/regions/:id"), async (req: Request, res: Response) => {
    try {
      const regionService = require('./services/region-service');
      const region = await regionService.getRegionById(parseInt(req.params.id));
      res.json(region);
    } catch (error: any) {
      console.error('Error fetching region:', error);
      res.status(500).json({ message: error.message || 'Failed to fetch region' });
    }
  });

  app.post(apiRouter("/regions"), async (req: Request, res: Response) => {
    try {
      const regionService = require('./services/region-service');
      const region = await regionService.createRegion(req.body);
      res.status(201).json(region);
    } catch (error: any) {
      console.error('Error creating region:', error);
      res.status(500).json({ message: error.message || 'Failed to create region' });
    }
  });

  app.put(apiRouter("/regions/:id"), async (req: Request, res: Response) => {
    try {
      const regionService = require('./services/region-service');
      const region = await regionService.updateRegion(parseInt(req.params.id), req.body);
      res.json(region);
    } catch (error: any) {
      console.error('Error updating region:', error);
      res.status(500).json({ message: error.message || 'Failed to update region' });
    }
  });

  app.get(apiRouter("/regions/:id/partners"), async (req: Request, res: Response) => {
    try {
      const regionService = require('./services/region-service');
      const partners = await regionService.getPartnersByRegion(parseInt(req.params.id));
      res.json(partners);
    } catch (error: any) {
      console.error('Error fetching partners by region:', error);
      res.status(500).json({ message: error.message || 'Failed to fetch partners by region' });
    }
  });

  app.get(apiRouter("/regions/:id/products"), async (req: Request, res: Response) => {
    try {
      const regionService = require('./services/region-service');
      const products = await regionService.getProductsByRegion(parseInt(req.params.id));
      res.json(products);
    } catch (error: any) {
      console.error('Error fetching products by region:', error);
      res.status(500).json({ message: error.message || 'Failed to fetch products by region' });
    }
  });

  // PARTNER MANAGEMENT API ENDPOINTS
  app.get(apiRouter("/partners"), async (req: Request, res: Response) => {
    try {
      // Mock partners data
      const partners = [
        {
          id: 1,
          name: "TechRestore Inc.",
          email: "contact@techrestore.com",
          logo: "https://cdn-icons-png.flaticon.com/512/3659/3659899.png",
          contact_person: "John Smith",
          phone: "+1 (555) 234-5678",
          address: "123 Tech Blvd",
          city: "San Francisco",
          state: "CA",
          country: "USA",
          postal_code: "94105",
          region_ids: [1, 2],
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          name: "Green Gadget Recyclers",
          email: "info@greengadget.org",
          logo: "https://cdn-icons-png.flaticon.com/512/5325/5325023.png",
          contact_person: "Mary Johnson",
          phone: "+1 (555) 876-5432",
          address: "456 Eco Street",
          city: "Portland",
          state: "OR",
          country: "USA",
          postal_code: "97204",
          region_ids: [2],
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          name: "ElectroHub Partners",
          email: "partners@electrohub.net",
          logo: "https://cdn-icons-png.flaticon.com/512/1589/1589592.png",
          contact_person: "Alex Williams",
          phone: "+1 (555) 345-6789",
          address: "789 Circuit Ave",
          city: "Boston",
          state: "MA",
          country: "USA",
          postal_code: "02108",
          region_ids: [3],
          active: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      // If activeOnly is true, filter out inactive partners
      if (req.query.activeOnly === 'true') {
        res.json(partners.filter(p => p.active));
      } else {
        res.json(partners);
      }
    } catch (error: any) {
      console.error('Error fetching partners:', error);
      res.status(500).json({ message: error.message || 'Failed to fetch partners' });
    }
  });

  app.get(apiRouter("/partners/:id"), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Mock partners data
      const partners = [
        {
          id: 1,
          name: "TechRestore Inc.",
          email: "contact@techrestore.com",
          logo: "https://cdn-icons-png.flaticon.com/512/3659/3659899.png",
          contact_person: "John Smith",
          phone: "+1 (555) 234-5678",
          address: "123 Tech Blvd",
          city: "San Francisco",
          state: "CA",
          country: "USA",
          postal_code: "94105",
          region_ids: [1, 2],
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          name: "Green Gadget Recyclers",
          email: "info@greengadget.org",
          logo: "https://cdn-icons-png.flaticon.com/512/5325/5325023.png",
          contact_person: "Mary Johnson",
          phone: "+1 (555) 876-5432",
          address: "456 Eco Street",
          city: "Portland",
          state: "OR",
          country: "USA",
          postal_code: "97204",
          region_ids: [2],
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          name: "ElectroHub Partners",
          email: "partners@electrohub.net",
          logo: "https://cdn-icons-png.flaticon.com/512/1589/1589592.png",
          contact_person: "Alex Williams",
          phone: "+1 (555) 345-6789",
          address: "789 Circuit Ave",
          city: "Boston",
          state: "MA",
          country: "USA",
          postal_code: "02108",
          region_ids: [3],
          active: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      const partner = partners.find(p => p.id === parseInt(id));
      
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      
      res.json(partner);
    } catch (error: any) {
      console.error('Error fetching partner:', error);
      res.status(500).json({ message: error.message || 'Failed to fetch partner' });
    }
  });

  app.post(apiRouter("/partners"), async (req: Request, res: Response) => {
    try {
      const partnerData = req.body;
      
      // Mock create partner logic
      const newPartner = {
        id: 4, // Generate a new ID
        ...partnerData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      res.status(201).json(newPartner);
    } catch (error: any) {
      console.error('Error creating partner:', error);
      res.status(500).json({ message: error.message || 'Failed to create partner' });
    }
  });

  app.put(apiRouter("/partners/:id"), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const partnerData = req.body;
      
      // Mock update partner logic
      const updatedPartner = {
        id: parseInt(id),
        ...partnerData,
        updated_at: new Date().toISOString()
      };
      res.json(updatedPartner);
    } catch (error: any) {
      console.error('Error updating partner:', error);
      res.status(500).json({ message: error.message || 'Failed to update partner' });
    }
  });

  app.delete(apiRouter("/partners/:id"), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      // Mock delete partner response
      res.json({ 
        success: true, 
        message: `Partner ${id} deleted successfully` 
      });
    } catch (error: any) {
      console.error('Error deleting partner:', error);
      res.status(500).json({ message: error.message || 'Failed to delete partner' });
    }
  });

  app.get(apiRouter("/partners/:id/buyback-requests"), async (req: Request, res: Response) => {
    try {
      const partnerService = require('./services/partner-service');
      const buybackRequests = await partnerService.getPartnerBuybackRequests(parseInt(req.params.id), {
        status: req.query.status as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
      });
      res.json(buybackRequests);
    } catch (error: any) {
      console.error('Error fetching partner buyback requests:', error);
      res.status(500).json({ message: error.message || 'Failed to fetch partner buyback requests' });
    }
  });

  app.post(apiRouter("/partners/assign-buyback"), async (req: Request, res: Response) => {
    try {
      const { buybackRequestId, partnerId } = req.body;
      
      if (!buybackRequestId || !partnerId) {
        return res.status(400).json({ message: 'Missing required fields: buybackRequestId or partnerId' });
      }

      // Get the buyback request
      const buybackRequest = await storage.getBuybackRequest(Number(buybackRequestId));
      if (!buybackRequest) {
        return res.status(404).json({ message: 'Buyback request not found' });
      }

      // Update the buyback request with the partner ID
      const updatedRequest = await storage.updateBuybackRequest(Number(buybackRequestId), {
        partner_id: Number(partnerId),
        status: 'assigned', // Update status to assigned
        updated_at: new Date()
      });

      if (!updatedRequest) {
        return res.status(500).json({ message: 'Failed to update buyback request' });
      }

      res.json({
        success: true,
        message: 'Buyback request assigned successfully',
        buybackRequest: updatedRequest
      });
    } catch (error: any) {
      console.error('Error assigning buyback to partner:', error);
      res.status(500).json({ message: error.message || 'Failed to assign buyback to partner' });
    }
  });

  // QUESTIONNAIRE API ENDPOINTS
  app.get(apiRouter("/questionnaires/device"), async (req: Request, res: Response) => {
    try {
      const questionnaireService = require('./services/questionnaire-service');
      const questionnaire = await questionnaireService.getDeviceQuestionnaire({
        deviceTypeId: parseInt(req.query.deviceTypeId as string),
        brandId: req.query.brandId ? parseInt(req.query.brandId as string) : undefined,
      });
      res.json(questionnaire);
    } catch (error: any) {
      console.error('Error fetching device questionnaire:', error);
      res.status(500).json({ message: error.message || 'Failed to fetch device questionnaire' });
    }
  });

  app.get(apiRouter("/questionnaires/brands"), async (req: Request, res: Response) => {
    try {
      const questionnaireService = require('./services/questionnaire-service');
      const questionnaires = await questionnaireService.getAllBrandQuestionnaires();
      res.json(questionnaires);
    } catch (error: any) {
      console.error('Error fetching brand questionnaires:', error);
      res.status(500).json({ message: error.message || 'Failed to fetch brand questionnaires' });
    }
  });

  app.post(apiRouter("/questionnaires"), async (req: Request, res: Response) => {
    try {
      const questionnaireService = require('./services/questionnaire-service');
      const result = await questionnaireService.createQuestionWithAnswers(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      console.error('Error creating questionnaire:', error);
      res.status(500).json({ message: error.message || 'Failed to create questionnaire' });
    }
  });

  app.post(apiRouter("/questionnaires/calculate-impact"), async (req: Request, res: Response) => {
    try {
      const questionnaireService = require('./services/questionnaire-service');
      const impact = await questionnaireService.calculateQuestionnaireImpact({
        deviceModelId: parseInt(req.body.deviceModelId),
        answers: req.body.answers,
      });
      res.json(impact);
    } catch (error: any) {
      console.error('Error calculating questionnaire impact:', error);
      res.status(500).json({ message: error.message || 'Failed to calculate questionnaire impact' });
    }
  });
  
  // E-COMMERCE API ENDPOINTS

  // Stripe payment integration
  app.post(apiRouter("/create-payment-intent"), async (req: Request, res: Response) => {
    try {
      const { amount } = req.body;
      
      if (!amount) {
        return res.status(400).json({ message: "Amount is required" });
      }
      
      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ message: "Stripe secret key is not configured" });
      }
      
      const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: error.message || "Failed to create payment intent" });
    }
  });

  // Products API
  app.get(apiRouter("/products"), async (req: Request, res: Response) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const status = req.query.status as string | undefined;
      const featured = req.query.featured ? req.query.featured === 'true' : undefined;
      const categoryId = req.query.category ? parseInt(req.query.category as string) : undefined;
      
      const products = await storage.getProducts({ page, limit, status, featured, categoryId });
      res.json(products);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: error.message || "Failed to fetch products" });
    }
  });

  app.get(apiRouter("/products/:id"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error: any) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: error.message || "Failed to fetch product" });
    }
  });

  app.post(apiRouter("/products"), async (req: Request, res: Response) => {
    try {
      const productData = validateRequest<InsertProduct>(insertProductSchema, req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message });
      }
      console.error("Error creating product:", error);
      res.status(500).json({ message: error.message || "Failed to create product" });
    }
  });

  app.put(apiRouter("/products/:id"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const productData = validateRequest<Partial<InsertProduct>>(insertProductSchema.partial(), req.body);
      const updatedProduct = await storage.updateProduct(id, productData);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message });
      }
      console.error("Error updating product:", error);
      res.status(500).json({ message: error.message || "Failed to update product" });
    }
  });

  app.delete(apiRouter("/products/:id"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const success = await storage.deleteProduct(id);
      
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: error.message || "Failed to delete product" });
    }
  });

  // Product Variants API
  app.get(apiRouter("/products/:productId/variants"), async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.productId);
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const variants = await storage.getProductVariants(productId);
      res.json(variants);
    } catch (error: any) {
      console.error("Error fetching product variants:", error);
      res.status(500).json({ message: error.message || "Failed to fetch product variants" });
    }
  });

  app.post(apiRouter("/products/:productId/variants"), async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.productId);
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const variantData = validateRequest<InsertProductVariant>(insertProductVariantSchema, {
        ...req.body,
        product_id: productId
      });
      
      const variant = await storage.createProductVariant(variantData);
      res.status(201).json(variant);
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message });
      }
      console.error("Error creating product variant:", error);
      res.status(500).json({ message: error.message || "Failed to create product variant" });
    }
  });

  // Categories API
  app.get(apiRouter("/categories"), async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: error.message || "Failed to fetch categories" });
    }
  });

  app.post(apiRouter("/categories"), async (req: Request, res: Response) => {
    try {
      const categoryData = validateRequest<InsertCategory>(insertCategorySchema, req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message });
      }
      console.error("Error creating category:", error);
      res.status(500).json({ message: error.message || "Failed to create category" });
    }
  });

  // Discounts API
  app.get(apiRouter("/discounts"), async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string | undefined;
      const discounts = await storage.getDiscounts(status);
      res.json(discounts);
    } catch (error: any) {
      console.error("Error fetching discounts:", error);
      res.status(500).json({ message: error.message || "Failed to fetch discounts" });
    }
  });

  app.post(apiRouter("/discounts"), async (req: Request, res: Response) => {
    try {
      const discountData = validateRequest<InsertDiscount>(insertDiscountSchema, req.body);
      const discount = await storage.createDiscount(discountData);
      res.status(201).json(discount);
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message });
      }
      console.error("Error creating discount:", error);
      res.status(500).json({ message: error.message || "Failed to create discount" });
    }
  });

  // Verify discount code
  app.post(apiRouter("/discounts/verify"), async (req: Request, res: Response) => {
    try {
      const { code, total } = req.body;
      
      if (!code) {
        return res.status(400).json({ message: "Discount code is required" });
      }
      
      const discount = await storage.verifyDiscount(code, total);
      
      if (!discount) {
        return res.status(404).json({ message: "Invalid or expired discount code" });
      }
      
      res.json(discount);
    } catch (error: any) {
      console.error("Error verifying discount:", error);
      res.status(500).json({ message: error.message || "Failed to verify discount" });
    }
  });

  // Invoice Templates
  app.get(apiRouter("/invoice-templates"), async (req: Request, res: Response) => {
    try {
      const partnerId = req.query.partner_id ? parseInt(req.query.partner_id as string) : undefined;
      const templates = await storage.getInvoiceTemplates(partnerId);
      res.json(templates);
    } catch (error) {
      console.error("Error getting invoice templates:", error);
      res.status(500).json({ message: "Failed to get invoice templates" });
    }
  });
  
  // Device Valuations for Buyback System
  app.get(apiRouter("/valuations"), async (req: Request, res: Response) => {
    try {
      const modelId = req.query.model_id ? parseInt(req.query.model_id as string) : undefined;
      const brandId = req.query.brand_id ? parseInt(req.query.brand_id as string) : undefined;
      const regionId = req.query.region_id ? parseInt(req.query.region_id as string) : undefined;
      
      const valuations = await storage.getValuations(modelId, brandId, regionId);
      res.json(valuations);
    } catch (error) {
      console.error("Error fetching valuations:", error);
      res.status(500).json({ message: "Failed to fetch valuations" });
    }
  });
  
  app.get(apiRouter("/valuations/:id"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const valuation = await storage.getValuation(id);
      
      if (!valuation) {
        return res.status(404).json({ message: "Valuation not found" });
      }
      
      res.json(valuation);
    } catch (error) {
      console.error(`Error fetching valuation ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch valuation" });
    }
  });
  
  app.get(apiRouter("/valuations/lookup"), async (req: Request, res: Response) => {
    try {
      const { model_id, brand_id, region_id } = req.query;
      
      if (!model_id || !brand_id) {
        return res.status(400).json({ message: "model_id and brand_id are required" });
      }
      
      const modelId = parseInt(model_id as string, 10);
      const brandId = parseInt(brand_id as string, 10);
      const regionId = region_id ? parseInt(region_id as string, 10) : undefined;
      
      const valuation = await storage.getValuationByModelBrandRegion(modelId, brandId, regionId);
      
      if (!valuation) {
        return res.status(404).json({ message: "No valuation found for this device configuration" });
      }
      
      res.json(valuation);
    } catch (error) {
      console.error("Error looking up valuation:", error);
      res.status(500).json({ message: "Failed to lookup valuation" });
    }
  });
  
  app.post(apiRouter("/valuations"), async (req: Request, res: Response) => {
    try {
      const valuationData = req.body;
      
      // Basic validation
      if (!valuationData.deviceModelId || !valuationData.brandId || !valuationData.basePrice) {
        return res.status(400).json({ 
          message: "Required fields missing - deviceModelId, brandId, and basePrice are required" 
        });
      }
      
      // Set defaults if not provided
      if (!valuationData.conditionMultipliers) {
        valuationData.conditionMultipliers = {
          "excellent": 1.0,
          "good": 0.8,
          "fair": 0.6,
          "poor": 0.4
        };
      }
      
      const newValuation = await storage.createValuation(valuationData);
      res.status(201).json(newValuation);
    } catch (error) {
      console.error("Error creating valuation:", error);
      res.status(500).json({ message: "Failed to create valuation" });
    }
  });
  
  app.put(apiRouter("/valuations/:id"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const valuationData = req.body;
      
      const updated = await storage.updateValuation(id, valuationData);
      
      if (!updated) {
        return res.status(404).json({ message: "Valuation not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error(`Error updating valuation ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to update valuation" });
    }
  });
  
  app.delete(apiRouter("/valuations/:id"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const success = await storage.deleteValuation(id);
      
      if (!success) {
        return res.status(404).json({ message: "Valuation not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error(`Error deleting valuation ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to delete valuation" });
    }
  });

  app.get(apiRouter("/invoice-templates/:id"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getInvoiceTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Invoice template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error getting invoice template:", error);
      res.status(500).json({ message: "Failed to get invoice template" });
    }
  });

  app.post(apiRouter("/invoice-templates"), async (req: Request, res: Response) => {
    try {
      const data = validateRequest<InsertInvoiceTemplate>(insertInvoiceTemplateSchema, req.body);
      
      // If this is a default template, unset default flag on all other templates
      if (data.is_default) {
        await storage.unsetDefaultInvoiceTemplates(data.partner_id);
      }
      
      const template = await storage.createInvoiceTemplate(data);
      res.status(201).json(template);
    } catch (error: any) {
      if (error.issues) {
        return res.status(400).json({ message: "Validation failed", errors: error.issues });
      }
      console.error("Error creating invoice template:", error);
      res.status(500).json({ message: "Failed to create invoice template" });
    }
  });

  app.put(apiRouter("/invoice-templates/:id"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const data = validateRequest<Partial<InsertInvoiceTemplate>>(
        insertInvoiceTemplateSchema.partial(), 
        req.body
      );
      
      // If this is being set as default, unset default flag on all other templates
      if (data.is_default) {
        await storage.unsetDefaultInvoiceTemplates(data.partner_id);
      }
      
      const template = await storage.updateInvoiceTemplate(id, data);
      if (!template) {
        return res.status(404).json({ message: "Invoice template not found" });
      }
      res.json(template);
    } catch (error: any) {
      if (error.issues) {
        return res.status(400).json({ message: "Validation failed", errors: error.issues });
      }
      console.error("Error updating invoice template:", error);
      res.status(500).json({ message: "Failed to update invoice template" });
    }
  });

  app.delete(apiRouter("/invoice-templates/:id"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteInvoiceTemplate(id);
      if (!success) {
        return res.status(404).json({ message: "Invoice template not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting invoice template:", error);
      res.status(500).json({ message: "Failed to delete invoice template" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
