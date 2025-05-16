import { Request, Response, Router } from "express";
import { FeatureToggleService } from "../services/featureToggleService";
import { z } from "zod";
import { insertFeatureToggleSchema } from "../../shared/schema";

const featureToggleRouter = Router();

// Validate request body against schema
const validateRequest = <T>(schema: z.ZodType<T>, data: unknown): { data: T; errors: null } | { data: null; errors: z.ZodError } => {
  try {
    const validData = schema.parse(data);
    return { data: validData, errors: null };
  } catch (error) {
    return { data: null, errors: error as z.ZodError };
  }
};

// Get all feature toggles
featureToggleRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const toggles = await FeatureToggleService.getAllToggles();
    res.json(toggles);
  } catch (error) {
    console.error("Error fetching feature toggles:", error);
    res.status(500).json({ message: "Failed to fetch feature toggles" });
  }
});

// Get feature toggles by category
featureToggleRouter.get("/category/:category", async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const toggles = await FeatureToggleService.getTogglesByCategory(category);
    res.json(toggles);
  } catch (error) {
    console.error(`Error fetching feature toggles for category ${req.params.category}:`, error);
    res.status(500).json({ message: "Failed to fetch feature toggles" });
  }
});

// Get a specific feature toggle
featureToggleRouter.get("/:featureKey", async (req: Request, res: Response) => {
  try {
    const { featureKey } = req.params;
    const toggle = await FeatureToggleService.getToggleByKey(featureKey);
    
    if (!toggle) {
      return res.status(404).json({ message: `Feature toggle '${featureKey}' not found` });
    }
    
    res.json(toggle);
  } catch (error) {
    console.error(`Error fetching feature toggle ${req.params.featureKey}:`, error);
    res.status(500).json({ message: "Failed to fetch feature toggle" });
  }
});

// Create a new feature toggle
featureToggleRouter.post("/", async (req: Request, res: Response) => {
  try {
    const validation = validateRequest(insertFeatureToggleSchema, req.body);
    
    if (validation.errors) {
      return res.status(400).json({ 
        message: "Invalid feature toggle data", 
        errors: validation.errors.format() 
      });
    }
    
    const newToggle = await FeatureToggleService.createToggle(validation.data);
    res.status(201).json(newToggle);
  } catch (error) {
    console.error("Error creating feature toggle:", error);
    res.status(500).json({ message: "Failed to create feature toggle" });
  }
});

// Update a feature toggle
featureToggleRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    // We allow partial updates
    const updateSchema = insertFeatureToggleSchema.partial();
    const validation = validateRequest(updateSchema, req.body);
    
    if (validation.errors) {
      return res.status(400).json({ 
        message: "Invalid feature toggle data", 
        errors: validation.errors.format() 
      });
    }
    
    const updatedToggle = await FeatureToggleService.updateToggle(id, validation.data);
    
    if (!updatedToggle) {
      return res.status(404).json({ message: `Feature toggle with ID ${id} not found` });
    }
    
    res.json(updatedToggle);
  } catch (error) {
    console.error(`Error updating feature toggle ${req.params.id}:`, error);
    res.status(500).json({ message: "Failed to update feature toggle" });
  }
});

// Enable or disable a feature toggle
featureToggleRouter.patch("/:featureKey/toggle", async (req: Request, res: Response) => {
  try {
    const { featureKey } = req.params;
    const { isEnabled, userId } = req.body;
    
    if (typeof isEnabled !== 'boolean') {
      return res.status(400).json({ message: "isEnabled must be a boolean" });
    }
    
    if (!userId || typeof userId !== 'number') {
      return res.status(400).json({ message: "userId is required and must be a number" });
    }
    
    const updatedToggle = await FeatureToggleService.setToggleState(featureKey, isEnabled, userId);
    
    if (!updatedToggle) {
      return res.status(404).json({ message: `Feature toggle '${featureKey}' not found` });
    }
    
    res.json(updatedToggle);
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
    
    await FeatureToggleService.deleteToggle(id);
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
    const scopeId = req.query.scopeId ? parseInt(req.query.scopeId as string, 10) : undefined;
    
    const isEnabled = await FeatureToggleService.isFeatureEnabled(featureKey, scopeId);
    res.json({ featureKey, isEnabled });
  } catch (error) {
    console.error(`Error checking feature status ${req.params.featureKey}:`, error);
    res.status(500).json({ message: "Failed to check feature status" });
  }
});

// Initialize default feature toggles
featureToggleRouter.post("/initialize", async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    if (!userId || typeof userId !== 'number') {
      return res.status(400).json({ message: "userId is required and must be a number" });
    }
    
    await FeatureToggleService.initializeDefaultToggles(userId);
    res.status(200).json({ message: "Default feature toggles initialized successfully" });
  } catch (error) {
    console.error("Error initializing default feature toggles:", error);
    res.status(500).json({ message: "Failed to initialize default feature toggles" });
  }
});

export default featureToggleRouter;