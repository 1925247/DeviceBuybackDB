import { Router, Request, Response } from "express";
import { TenantService } from "../services/tenantService";
import { tenantMiddleware, requireTenant } from "../middleware/tenantMiddleware";

// Create router and tenant service
const router = Router();
const tenantService = new TenantService();

// Apply tenant middleware to all routes
router.use(tenantMiddleware);

// Get tenant configuration
router.get("/tenant/config", requireTenant, async (req: any, res: Response) => {
  try {
    const { partnerId } = req.tenantContext;
    const config = await tenantService.getTenantConfig(partnerId);
    
    if (!config) {
      return res.status(404).json({
        message: "Tenant configuration not found"
      });
    }
    
    res.json(config);
  } catch (error) {
    console.error("Error getting tenant config:", error);
    res.status(500).json({
      message: "Error getting tenant configuration"
    });
  }
});

// Create or update tenant configuration
router.post("/tenant/config", requireTenant, async (req: any, res: Response) => {
  try {
    const { partnerId } = req.tenantContext;
    const { settings } = req.body;
    
    const config = await tenantService.createOrUpdateTenantConfig(partnerId, settings);
    
    if (!config) {
      return res.status(500).json({
        message: "Failed to create or update tenant configuration"
      });
    }
    
    res.status(201).json(config);
  } catch (error) {
    console.error("Error creating/updating tenant config:", error);
    res.status(500).json({
      message: "Error creating or updating tenant configuration"
    });
  }
});

// Get partner inventory
router.get("/tenant/inventory", requireTenant, async (req: any, res: Response) => {
  try {
    const { partnerId } = req.tenantContext;
    const inventory = await tenantService.getPartnerInventory(partnerId);
    
    res.json(inventory);
  } catch (error) {
    console.error("Error getting partner inventory:", error);
    res.status(500).json({
      message: "Error getting partner inventory"
    });
  }
});

// Add or update inventory item
router.post("/tenant/inventory", requireTenant, async (req: any, res: Response) => {
  try {
    const { partnerId } = req.tenantContext;
    const { deviceModelId, condition, quantity, price, isAvailable } = req.body;
    
    if (!deviceModelId || !condition || quantity === undefined || price === undefined) {
      return res.status(400).json({
        message: "Missing required fields: deviceModelId, condition, quantity, price"
      });
    }
    
    const item = await tenantService.addOrUpdateInventoryItem({
      partnerId,
      deviceModelId,
      condition,
      quantity,
      price,
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });
    
    if (!item) {
      return res.status(500).json({
        message: "Failed to add or update inventory item"
      });
    }
    
    res.status(201).json(item);
  } catch (error) {
    console.error("Error adding/updating inventory item:", error);
    res.status(500).json({
      message: "Error adding or updating inventory item"
    });
  }
});

// Get partner price rules
router.get("/tenant/price-rules", requireTenant, async (req: any, res: Response) => {
  try {
    const { partnerId } = req.tenantContext;
    const deviceModelId = req.query.deviceModelId ? parseInt(req.query.deviceModelId as string) : undefined;
    
    const rules = await tenantService.getPartnerPriceRules(partnerId, deviceModelId);
    
    res.json(rules);
  } catch (error) {
    console.error("Error getting partner price rules:", error);
    res.status(500).json({
      message: "Error getting partner price rules"
    });
  }
});

// Add or update price rule
router.post("/tenant/price-rules", requireTenant, async (req: any, res: Response) => {
  try {
    const { partnerId } = req.tenantContext;
    const {
      deviceModelId,
      conditionFactor,
      basePrice,
      minPrice,
      maxPrice,
      isActive
    } = req.body;
    
    if (!deviceModelId || conditionFactor === undefined || basePrice === undefined || 
        minPrice === undefined || maxPrice === undefined) {
      return res.status(400).json({
        message: "Missing required fields: deviceModelId, conditionFactor, basePrice, minPrice, maxPrice"
      });
    }
    
    const rule = await tenantService.addOrUpdatePriceRule({
      partnerId,
      deviceModelId,
      conditionFactor,
      basePrice,
      minPrice,
      maxPrice,
      isActive: isActive !== undefined ? isActive : true
    });
    
    if (!rule) {
      return res.status(500).json({
        message: "Failed to add or update price rule"
      });
    }
    
    res.status(201).json(rule);
  } catch (error) {
    console.error("Error adding/updating price rule:", error);
    res.status(500).json({
      message: "Error adding or updating price rule"
    });
  }
});

// Get partner leads
router.get("/tenant/leads", requireTenant, async (req: any, res: Response) => {
  try {
    const { partnerId } = req.tenantContext;
    const status = req.query.status as string | undefined;
    
    const leads = await tenantService.getPartnerLeads(partnerId, status);
    
    res.json(leads);
  } catch (error) {
    console.error("Error getting partner leads:", error);
    res.status(500).json({
      message: "Error getting partner leads"
    });
  }
});

// Add a new lead
router.post("/tenant/leads", requireTenant, async (req: any, res: Response) => {
  try {
    const { partnerId } = req.tenantContext;
    const {
      userId,
      deviceModelId,
      estimatedValue,
      status,
      notes,
      assignedStaffId
    } = req.body;
    
    if (!status) {
      return res.status(400).json({
        message: "Missing required field: status"
      });
    }
    
    const lead = await tenantService.addLead({
      partnerId,
      userId,
      deviceModelId,
      estimatedValue,
      status,
      notes,
      assignedStaffId
    });
    
    if (!lead) {
      return res.status(500).json({
        message: "Failed to add lead"
      });
    }
    
    res.status(201).json(lead);
  } catch (error) {
    console.error("Error adding lead:", error);
    res.status(500).json({
      message: "Error adding lead"
    });
  }
});

// Update a lead
router.put("/tenant/leads/:id", requireTenant, async (req: any, res: Response) => {
  try {
    const { partnerId } = req.tenantContext;
    const leadId = parseInt(req.params.id);
    
    if (isNaN(leadId)) {
      return res.status(400).json({
        message: "Invalid lead ID"
      });
    }
    
    const {
      status,
      notes,
      assignedStaffId,
      estimatedValue
    } = req.body;
    
    const lead = await tenantService.updateLead(leadId, partnerId, {
      status,
      notes,
      assignedStaffId,
      estimatedValue
    });
    
    if (!lead) {
      return res.status(404).json({
        message: "Lead not found or update failed"
      });
    }
    
    res.json(lead);
  } catch (error) {
    console.error("Error updating lead:", error);
    res.status(500).json({
      message: "Error updating lead"
    });
  }
});

export default router;