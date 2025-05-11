import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertDeviceSchema, insertUserSchema, insertBuybackRequestSchema, insertMarketplaceListingSchema, insertOrderSchema,
  type InsertUser, type InsertDevice, type InsertBuybackRequest, type InsertMarketplaceListing, type InsertOrder
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up API prefix
  const apiRouter = (path: string) => `/api${path}`;

  // Helper for handling validation errors
  const validateRequest = <T>(schema: any, data: unknown): T => {
    try {
      return schema.parse(data) as T;
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        throw { status: 400, message: validationError.message };
      }
      throw error;
    }
  };

  // Database status endpoint
  app.get(apiRouter("/status"), async (_req: Request, res: Response) => {
    try {
      const status = await storage.getDatabaseStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Failed to get database status" });
    }
  });
  
  // Device types API endpoint
  app.get(apiRouter("/device-types"), async (_req: Request, res: Response) => {
    try {
      const deviceTypesData = await storage.getDeviceTypes();
      res.json(deviceTypesData);
    } catch (error: any) {
      console.error("Error fetching device types:", error);
      res.status(500).json({ message: error.message || "Failed to fetch device types" });
    }
  });

  // Brands API endpoint
  app.get(apiRouter("/brands"), async (_req: Request, res: Response) => {
    try {
      const brandsData = await storage.getBrands();
      res.json(brandsData);
    } catch (error: any) {
      console.error("Error fetching brands:", error);
      res.status(500).json({ message: error.message || "Failed to fetch brands" });
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

  // Condition questions API endpoint
  app.get(apiRouter("/condition-questions"), async (req: Request, res: Response) => {
    try {
      const deviceTypeId = req.query.deviceTypeId ? Number(req.query.deviceTypeId) : undefined;
      const questionsData = await storage.getConditionQuestions(deviceTypeId);
      res.json(questionsData);
    } catch (error: any) {
      console.error("Error fetching condition questions:", error);
      res.status(500).json({ message: error.message || "Failed to fetch condition questions" });
    }
  });

  // Valuations API endpoint
  app.get(apiRouter("/valuations"), async (req: Request, res: Response) => {
    try {
      const deviceModelId = req.query.deviceModelId ? Number(req.query.deviceModelId) : undefined;
      const valuationsData = await storage.getValuations(deviceModelId);
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
      const requestData = validateRequest<InsertBuybackRequest>(insertBuybackRequestSchema, req.body);
      const request = await storage.createBuybackRequest(requestData);
      res.status(201).json(request);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || "Failed to create buyback request" });
    }
  });

  app.get(apiRouter("/buyback-requests"), async (req: Request, res: Response) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const status = req.query.status as string | undefined;
      const requests = await storage.getBuybackRequests(page, limit, status);
      
      // Get total count for pagination
      const count = await storage.getBuybackRequestsCount(status);
      const totalPages = Math.ceil(count / limit);
      
      // Return in the format expected by the frontend
      res.json({
        requests,
        totalPages,
        currentPage: page
      });
    } catch (error: any) {
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
      const listingData = validateRequest(insertMarketplaceListingSchema.partial(), req.body);
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
      const orderData = validateRequest(insertOrderSchema, req.body);
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
      const orderData = validateRequest(insertOrderSchema.partial(), req.body);
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

  const httpServer = createServer(app);

  return httpServer;
}
