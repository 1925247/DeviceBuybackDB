import express, { Request, Response } from "express";
import { z } from "zod";
import * as featureToggleService from "../services/featureToggleService";

export const featureToggleRouter = express.Router();

// Validation schemas
const toggleSchema = z.object({
  featureKey: z.string().min(3),
  displayName: z.string().min(2),
  description: z.string().min(5),
  isEnabled: z.boolean().default(false),
  category: z.string().min(2),
  scope: z.string(),
  scopeId: z.number().optional().nullable(),
  requiredPermission: z.string().optional(),
  lastModifiedBy: z.number().optional(),
});

const toggleUpdateSchema = toggleSchema.partial();

const toggleStatusSchema = z.object({
  isEnabled: z.boolean(),
  userId: z.number().optional(),
});

const validateRequest = <T>(schema: z.ZodType<T>, data: unknown): { data: T; errors: null } | { data: null; errors: z.ZodError } => {
  try {
    const validated = schema.parse(data);
    return { data: validated, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { data: null, errors: error };
    }
    throw error;
  }
};

// Get all feature toggles
featureToggleRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const toggles = await featureToggleService.getAllFeatureToggles();
    res.json(toggles);
  } catch (error) {
    console.error("Error getting feature toggles:", error);
    res.status(500).json({ message: "Failed to get feature toggles" });
  }
});

// Get toggles by category
featureToggleRouter.get("/category/:category", async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const toggles = await featureToggleService.getFeatureTogglesByCategory(category);
    res.json(toggles);
  } catch (error) {
    console.error(`Error getting feature toggles for category ${req.params.category}:`, error);
    res.status(500).json({ message: "Failed to get feature toggles" });
  }
});

// Get a specific toggle by key
featureToggleRouter.get("/:featureKey", async (req: Request, res: Response) => {
  try {
    const { featureKey } = req.params;
    const toggle = await featureToggleService.getFeatureToggleByKey(featureKey);
    
    if (!toggle) {
      return res.status(404).json({ message: "Feature toggle not found" });
    }
    
    res.json(toggle);
  } catch (error) {
    console.error(`Error getting feature toggle ${req.params.featureKey}:`, error);
    res.status(500).json({ message: "Failed to get feature toggle" });
  }
});

// Create a new feature toggle
featureToggleRouter.post("/", async (req: Request, res: Response) => {
  try {
    const validation = validateRequest(toggleSchema, req.body);
    
    if (validation.errors) {
      return res.status(400).json({ 
        message: "Invalid request data", 
        errors: validation.errors.format() 
      });
    }
    
    const toggle = await featureToggleService.createFeatureToggle(validation.data);
    res.status(201).json(toggle);
  } catch (error: any) {
    if (error.message && error.message.includes("already exists")) {
      return res.status(409).json({ message: error.message });
    }
    
    console.error("Error creating feature toggle:", error);
    res.status(500).json({ message: "Failed to create feature toggle" });
  }
});

// Update an existing feature toggle
featureToggleRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const validation = validateRequest(toggleUpdateSchema, req.body);
    
    if (validation.errors) {
      return res.status(400).json({ 
        message: "Invalid request data", 
        errors: validation.errors.format() 
      });
    }
    
    const updatedToggle = await featureToggleService.updateFeatureToggle(id, validation.data);
    
    if (!updatedToggle) {
      return res.status(404).json({ message: "Feature toggle not found" });
    }
    
    res.json(updatedToggle);
  } catch (error) {
    console.error(`Error updating feature toggle ${req.params.id}:`, error);
    res.status(500).json({ message: "Failed to update feature toggle" });
  }
});

// Toggle a feature on/off
featureToggleRouter.patch("/:featureKey/toggle", async (req: Request, res: Response) => {
  try {
    const { featureKey } = req.params;
    const validation = validateRequest(toggleStatusSchema, req.body);
    
    if (validation.errors) {
      return res.status(400).json({ 
        message: "Invalid request data", 
        errors: validation.errors.format() 
      });
    }
    
    const { isEnabled, userId } = validation.data;
    const result = await featureToggleService.toggleFeature(featureKey, isEnabled, userId);
    
    if (!result) {
      return res.status(404).json({ message: "Feature toggle not found" });
    }
    
    res.json(result);
  } catch (error) {
    console.error(`Error toggling feature ${req.params.featureKey}:`, error);
    res.status(500).json({ message: "Failed to toggle feature" });
  }
});

// Delete a feature toggle
featureToggleRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const success = await featureToggleService.deleteFeatureToggle(id);
    
    if (!success) {
      return res.status(404).json({ message: "Feature toggle not found" });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting feature toggle ${req.params.id}:`, error);
    res.status(500).json({ message: "Failed to delete feature toggle" });
  }
});

// Check if a feature is enabled
featureToggleRouter.get("/:featureKey/status", async (req: Request, res: Response) => {
  try {
    const { featureKey } = req.params;
    const { scope, scopeId } = req.query;
    
    const isEnabled = await featureToggleService.isFeatureEnabled(
      featureKey,
      scope as string | undefined,
      scopeId ? parseInt(scopeId as string, 10) : undefined
    );
    
    res.json({ featureKey, isEnabled });
  } catch (error) {
    console.error(`Error checking feature status ${req.params.featureKey}:`, error);
    res.status(500).json({ message: "Failed to check feature status" });
  }
});

// Initialize default toggles
featureToggleRouter.post("/initialize", async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;
    const toggles = await featureToggleService.initializeDefaultToggles(userId);
    res.json(toggles);
  } catch (error) {
    console.error("Error initializing default feature toggles:", error);
    res.status(500).json({ message: "Failed to initialize default feature toggles" });
  }
});

export default featureToggleRouter;