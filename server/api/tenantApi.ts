import { Router, Request, Response } from "express";
import { db } from "../db";
import { eq, sql } from "drizzle-orm";
import { partners } from "@shared/schema";
import * as tenancy from "@shared/tenancy";
import { tenantMiddleware, requireTenant, getTenantData, insertTenantData, updateTenantData, deleteTenantData } from "../helpers/tenantHelper";

// Create router
const router = Router();

// Apply tenant middleware to all routes
router.use(tenantMiddleware);

/**
 * Get tenant configuration
 */
router.get("/tenant-config", requireTenant, async (req: any, res: Response) => {
  try {
    const { partnerId } = req.tenantContext;
    
    // Check if tenant configuration exists
    const [config] = await db.select()
      .from(tenancy.tenantConfigs)
      .where(eq(tenancy.tenantConfigs.partnerId, partnerId));
    
    if (config) {
      return res.json(config);
    }
    
    // If no configuration exists, create a default one
    const tenantId = tenancy.generateTenantId(partnerId);
    
    const [newConfig] = await db.insert(tenancy.tenantConfigs)
      .values({
        partnerId,
        tenantId,
        isActive: true,
        settings: {}
      })
      .returning();
    
    res.json(newConfig);
  } catch (error) {
    console.error("Error getting tenant configuration:", error);
    res.status(500).json({ message: "Error getting tenant configuration" });
  }
});

/**
 * Update tenant configuration
 */
router.put("/tenant-config", requireTenant, async (req: any, res: Response) => {
  try {
    const { partnerId } = req.tenantContext;
    const { settings, isActive } = req.body;
    
    // Check if tenant configuration exists
    const [config] = await db.select()
      .from(tenancy.tenantConfigs)
      .where(eq(tenancy.tenantConfigs.partnerId, partnerId));
    
    if (!config) {
      return res.status(404).json({ message: "Tenant configuration not found" });
    }
    
    // Update configuration
    const [updatedConfig] = await db.update(tenancy.tenantConfigs)
      .set({
        settings: settings || config.settings,
        isActive: isActive !== undefined ? isActive : config.isActive,
        updatedAt: new Date()
      })
      .where(eq(tenancy.tenantConfigs.partnerId, partnerId))
      .returning();
    
    res.json(updatedConfig);
  } catch (error) {
    console.error("Error updating tenant configuration:", error);
    res.status(500).json({ message: "Error updating tenant configuration" });
  }
});

/**
 * Get partner-specific inventory
 */
router.get("/inventory", requireTenant, async (req: any, res: Response) => {
  try {
    const { partnerId } = req.tenantContext;
    
    const inventory = await getTenantData("partner_inventory", partnerId);
    res.json(inventory);
  } catch (error) {
    console.error("Error getting inventory:", error);
    res.status(500).json({ message: "Error getting inventory" });
  }
});

/**
 * Add or update inventory item
 */
router.post("/inventory", requireTenant, async (req: any, res: Response) => {
  try {
    const { partnerId } = req.tenantContext;
    const { deviceModelId, condition, quantity, price, isAvailable } = req.body;
    
    if (!deviceModelId || !condition || quantity === undefined || price === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    // Check if item exists
    const existingItems = await getTenantData("partner_inventory", partnerId);
    const existingItem = existingItems.find(item => 
      item.device_model_id === deviceModelId && item.condition === condition
    );
    
    let result;
    
    if (existingItem) {
      // Update existing item
      result = await updateTenantData("partner_inventory", existingItem.id, {
        quantity,
        price,
        is_available: isAvailable !== undefined ? isAvailable : true,
        updated_at: new Date()
      }, partnerId);
    } else {
      // Create new item
      result = await insertTenantData("partner_inventory", {
        partner_id: partnerId,
        device_model_id: deviceModelId,
        condition,
        quantity,
        price,
        is_available: isAvailable !== undefined ? isAvailable : true,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error("Error managing inventory:", error);
    res.status(500).json({ message: "Error managing inventory" });
  }
});

/**
 * Get price rules for partner
 */
router.get("/price-rules", requireTenant, async (req: any, res: Response) => {
  try {
    const { partnerId } = req.tenantContext;
    const deviceModelId = req.query.deviceModelId ? parseInt(req.query.deviceModelId as string) : undefined;
    
    let rules = await getTenantData("partner_price_rules", partnerId);
    
    if (deviceModelId) {
      rules = rules.filter(rule => rule.device_model_id === deviceModelId);
    }
    
    res.json(rules);
  } catch (error) {
    console.error("Error getting price rules:", error);
    res.status(500).json({ message: "Error getting price rules" });
  }
});

/**
 * Create or update price rule
 */
router.post("/price-rules", requireTenant, async (req: any, res: Response) => {
  try {
    const { partnerId } = req.tenantContext;
    const { deviceModelId, conditionFactor, basePrice, minPrice, maxPrice, isActive } = req.body;
    
    if (!deviceModelId || conditionFactor === undefined || basePrice === undefined ||
        minPrice === undefined || maxPrice === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    // Check if rule exists
    const existingRules = await getTenantData("partner_price_rules", partnerId);
    const existingRule = existingRules.find(rule => rule.device_model_id === deviceModelId);
    
    let result;
    
    if (existingRule) {
      // Update existing rule
      result = await updateTenantData("partner_price_rules", existingRule.id, {
        condition_factor: conditionFactor,
        base_price: basePrice,
        min_price: minPrice,
        max_price: maxPrice,
        is_active: isActive !== undefined ? isActive : true,
        updated_at: new Date()
      }, partnerId);
    } else {
      // Create new rule
      result = await insertTenantData("partner_price_rules", {
        partner_id: partnerId,
        device_model_id: deviceModelId,
        condition_factor: conditionFactor,
        base_price: basePrice,
        min_price: minPrice,
        max_price: maxPrice,
        is_active: isActive !== undefined ? isActive : true,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error("Error managing price rule:", error);
    res.status(500).json({ message: "Error managing price rule" });
  }
});

/**
 * Get partner leads
 */
router.get("/leads", requireTenant, async (req: any, res: Response) => {
  try {
    const { partnerId } = req.tenantContext;
    const status = req.query.status as string | undefined;
    
    let leads = await getTenantData("partner_leads", partnerId);
    
    if (status) {
      leads = leads.filter(lead => lead.status === status);
    }
    
    res.json(leads);
  } catch (error) {
    console.error("Error getting leads:", error);
    res.status(500).json({ message: "Error getting leads" });
  }
});

/**
 * Add new lead
 */
router.post("/leads", requireTenant, async (req: any, res: Response) => {
  try {
    const { partnerId } = req.tenantContext;
    const { userId, deviceModelId, estimatedValue, status, notes, assignedStaffId } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    
    // Create new lead
    const result = await insertTenantData("partner_leads", {
      partner_id: partnerId,
      user_id: userId || null,
      device_model_id: deviceModelId || null,
      estimated_value: estimatedValue || null,
      status,
      notes: notes || null,
      assigned_staff_id: assignedStaffId || null,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating lead:", error);
    res.status(500).json({ message: "Error creating lead" });
  }
});

/**
 * Update lead
 */
router.put("/leads/:id", requireTenant, async (req: any, res: Response) => {
  try {
    const { partnerId } = req.tenantContext;
    const leadId = parseInt(req.params.id);
    
    if (isNaN(leadId)) {
      return res.status(400).json({ message: "Invalid lead ID" });
    }
    
    const { status, notes, assignedStaffId, estimatedValue } = req.body;
    
    // Update fields
    const updateData: any = {};
    
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (assignedStaffId !== undefined) updateData.assigned_staff_id = assignedStaffId;
    if (estimatedValue !== undefined) updateData.estimated_value = estimatedValue;
    updateData.updated_at = new Date();
    
    // Update lead
    const result = await updateTenantData("partner_leads", leadId, updateData, partnerId);
    
    res.json(result);
  } catch (error) {
    console.error("Error updating lead:", error);
    res.status(500).json({ message: "Error updating lead" });
  }
});

export default router;