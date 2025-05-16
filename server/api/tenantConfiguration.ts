import { Router, Request, Response } from "express";
import { db } from "../db";
import { eq, sql } from "drizzle-orm";
import { partners } from "@shared/schema";

const router = Router();

/**
 * Get all tenant configurations
 */
router.get("/tenant-configurations", async (req: Request, res: Response) => {
  try {
    // Get all tenant configurations from the database
    const results = await db.execute(sql`
      SELECT tc.*, p.name as partner_name
      FROM tenant_configs tc
      JOIN partners p ON tc.partner_id = p.id
      ORDER BY tc.created_at DESC
    `);
    
    res.json(results.rows);
  } catch (error) {
    console.error("Error getting tenant configurations:", error);
    res.status(500).json({ message: "Error getting tenant configurations" });
  }
});

/**
 * Get a tenant configuration by ID
 */
router.get("/tenant-configurations/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    
    const results = await db.execute(sql`
      SELECT tc.*, p.name as partner_name
      FROM tenant_configs tc
      JOIN partners p ON tc.partner_id = p.id
      WHERE tc.id = ${id}
    `);
    
    if (results.rows.length === 0) {
      return res.status(404).json({ message: "Tenant configuration not found" });
    }
    
    res.json(results.rows[0]);
  } catch (error) {
    console.error("Error getting tenant configuration:", error);
    res.status(500).json({ message: "Error getting tenant configuration" });
  }
});

/**
 * Create a new tenant configuration
 */
router.post("/tenant-configurations", async (req: Request, res: Response) => {
  try {
    const { partnerId, settings } = req.body;
    
    if (!partnerId) {
      return res.status(400).json({ message: "Partner ID is required" });
    }
    
    // Check if partner exists
    const [partner] = await db.select()
      .from(partners)
      .where(eq(partners.id, partnerId));
    
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }
    
    // Check if tenant configuration already exists
    const existingConfig = await db.execute(sql`
      SELECT * FROM tenant_configs WHERE partner_id = ${partnerId}
    `);
    
    if (existingConfig.rows.length > 0) {
      return res.status(400).json({ 
        message: "Tenant configuration already exists for this partner",
        existingConfig: existingConfig.rows[0]
      });
    }
    
    // Generate a unique tenant ID
    const tenantId = `partner_${partnerId}`;
    
    // Create new tenant configuration
    const result = await db.execute(sql`
      INSERT INTO tenant_configs
      (partner_id, tenant_id, settings, is_active, created_at, updated_at)
      VALUES (${partnerId}, ${tenantId}, ${settings ? JSON.stringify(settings) : '{}'}, true, NOW(), NOW())
      RETURNING *
    `);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating tenant configuration:", error);
    res.status(500).json({ message: "Error creating tenant configuration" });
  }
});

/**
 * Update a tenant configuration
 */
router.put("/tenant-configurations/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    
    const { settings, isActive } = req.body;
    
    // Check if tenant configuration exists
    const existingConfig = await db.execute(sql`
      SELECT * FROM tenant_configs WHERE id = ${id}
    `);
    
    if (existingConfig.rows.length === 0) {
      return res.status(404).json({ message: "Tenant configuration not found" });
    }
    
    // Update tenant configuration
    const result = await db.execute(sql`
      UPDATE tenant_configs
      SET 
        settings = ${settings ? JSON.stringify(settings) : existingConfig.rows[0].settings},
        is_active = ${isActive !== undefined ? isActive : existingConfig.rows[0].is_active},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating tenant configuration:", error);
    res.status(500).json({ message: "Error updating tenant configuration" });
  }
});

export default router;