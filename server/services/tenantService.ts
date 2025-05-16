import { db } from "../db";
import { eq, sql } from "drizzle-orm";
import * as schema from "@shared/schema";

// Type definitions for tenant operations
interface TenantConfig {
  id: number;
  partnerId: number;
  tenantId: string;
  settings: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PartnerInventoryItem {
  id?: number;
  partnerId: number;
  deviceModelId: number;
  condition: string;
  quantity: number;
  price: number;
  isAvailable: boolean;
}

interface PartnerPriceRule {
  id?: number;
  partnerId: number;
  deviceModelId: number;
  conditionFactor: number;
  basePrice: number;
  minPrice: number;
  maxPrice: number;
  isActive: boolean;
}

interface PartnerLead {
  id?: number;
  partnerId: number;
  userId?: number;
  deviceModelId?: number;
  estimatedValue?: number;
  status: string;
  notes?: string;
  assignedStaffId?: number;
}

/**
 * Service for managing tenant-specific operations
 */
export class TenantService {
  /**
   * Get tenant configuration by partner ID
   * @param partnerId - The partner ID
   * @returns Tenant configuration
   */
  async getTenantConfig(partnerId: number): Promise<TenantConfig | null> {
    try {
      const result = await db.execute(sql`
        SELECT * FROM tenant_configs
        WHERE partner_id = ${partnerId}
      `);
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error("Error getting tenant config:", error);
      return null;
    }
  }

  /**
   * Create or update tenant configuration
   * @param partnerId - The partner ID
   * @param settings - Optional tenant settings
   * @returns Created or updated tenant configuration
   */
  async createOrUpdateTenantConfig(partnerId: number, settings?: any): Promise<TenantConfig | null> {
    try {
      // Check if tenant config exists
      const existingConfig = await this.getTenantConfig(partnerId);
      
      if (existingConfig) {
        // Update existing config
        const result = await db.execute(sql`
          UPDATE tenant_configs
          SET 
            settings = ${settings ? JSON.stringify(settings) : existingConfig.settings},
            updated_at = NOW()
          WHERE partner_id = ${partnerId}
          RETURNING *
        `);
        
        return result.rows.length > 0 ? result.rows[0] : null;
      } else {
        // Create new config
        const tenantId = `partner_${partnerId}`;
        
        const result = await db.execute(sql`
          INSERT INTO tenant_configs
          (partner_id, tenant_id, settings, is_active, created_at, updated_at)
          VALUES (${partnerId}, ${tenantId}, ${settings ? JSON.stringify(settings) : '{}'}, true, NOW(), NOW())
          RETURNING *
        `);
        
        return result.rows.length > 0 ? result.rows[0] : null;
      }
    } catch (error) {
      console.error("Error creating/updating tenant config:", error);
      return null;
    }
  }

  /**
   * Get partner-specific inventory
   * @param partnerId - The partner ID
   * @returns Partner inventory items
   */
  async getPartnerInventory(partnerId: number): Promise<PartnerInventoryItem[]> {
    try {
      const result = await db.execute(sql`
        SELECT * FROM partner_inventory
        WHERE partner_id = ${partnerId}
        ORDER BY updated_at DESC
      `);
      
      return result.rows;
    } catch (error) {
      console.error("Error getting partner inventory:", error);
      return [];
    }
  }

  /**
   * Add or update inventory item for a partner
   * @param item - The inventory item to add or update
   * @returns Added or updated inventory item
   */
  async addOrUpdateInventoryItem(item: PartnerInventoryItem): Promise<PartnerInventoryItem | null> {
    try {
      // Check if item exists
      const result = await db.execute(sql`
        SELECT * FROM partner_inventory
        WHERE 
          partner_id = ${item.partnerId} AND 
          device_model_id = ${item.deviceModelId} AND
          condition = ${item.condition}
      `);
      
      if (result.rows.length > 0) {
        // Update existing item
        const existingItem = result.rows[0];
        
        const updateResult = await db.execute(sql`
          UPDATE partner_inventory
          SET 
            quantity = ${item.quantity},
            price = ${item.price},
            is_available = ${item.isAvailable},
            updated_at = NOW()
          WHERE id = ${existingItem.id}
          RETURNING *
        `);
        
        return updateResult.rows.length > 0 ? updateResult.rows[0] : null;
      } else {
        // Create new item
        const insertResult = await db.execute(sql`
          INSERT INTO partner_inventory
          (partner_id, device_model_id, condition, quantity, price, is_available, created_at, updated_at)
          VALUES (
            ${item.partnerId}, 
            ${item.deviceModelId}, 
            ${item.condition}, 
            ${item.quantity}, 
            ${item.price}, 
            ${item.isAvailable}, 
            NOW(), 
            NOW()
          )
          RETURNING *
        `);
        
        return insertResult.rows.length > 0 ? insertResult.rows[0] : null;
      }
    } catch (error) {
      console.error("Error adding/updating inventory item:", error);
      return null;
    }
  }

  /**
   * Get price rules for a partner
   * @param partnerId - The partner ID
   * @param deviceModelId - Optional device model ID to filter by
   * @returns Partner price rules
   */
  async getPartnerPriceRules(partnerId: number, deviceModelId?: number): Promise<PartnerPriceRule[]> {
    try {
      let query = sql`
        SELECT * FROM partner_price_rules
        WHERE partner_id = ${partnerId}
      `;
      
      if (deviceModelId) {
        query = sql`
          SELECT * FROM partner_price_rules
          WHERE partner_id = ${partnerId} AND device_model_id = ${deviceModelId}
        `;
      }
      
      const result = await db.execute(query);
      return result.rows;
    } catch (error) {
      console.error("Error getting partner price rules:", error);
      return [];
    }
  }

  /**
   * Add or update price rule for a partner
   * @param rule - The price rule to add or update
   * @returns Added or updated price rule
   */
  async addOrUpdatePriceRule(rule: PartnerPriceRule): Promise<PartnerPriceRule | null> {
    try {
      // Check if rule exists
      const result = await db.execute(sql`
        SELECT * FROM partner_price_rules
        WHERE 
          partner_id = ${rule.partnerId} AND 
          device_model_id = ${rule.deviceModelId}
      `);
      
      if (result.rows.length > 0) {
        // Update existing rule
        const existingRule = result.rows[0];
        
        const updateResult = await db.execute(sql`
          UPDATE partner_price_rules
          SET 
            condition_factor = ${rule.conditionFactor},
            base_price = ${rule.basePrice},
            min_price = ${rule.minPrice},
            max_price = ${rule.maxPrice},
            is_active = ${rule.isActive},
            updated_at = NOW()
          WHERE id = ${existingRule.id}
          RETURNING *
        `);
        
        return updateResult.rows.length > 0 ? updateResult.rows[0] : null;
      } else {
        // Create new rule
        const insertResult = await db.execute(sql`
          INSERT INTO partner_price_rules
          (partner_id, device_model_id, condition_factor, base_price, min_price, max_price, is_active, created_at, updated_at)
          VALUES (
            ${rule.partnerId}, 
            ${rule.deviceModelId}, 
            ${rule.conditionFactor}, 
            ${rule.basePrice}, 
            ${rule.minPrice}, 
            ${rule.maxPrice}, 
            ${rule.isActive}, 
            NOW(), 
            NOW()
          )
          RETURNING *
        `);
        
        return insertResult.rows.length > 0 ? insertResult.rows[0] : null;
      }
    } catch (error) {
      console.error("Error adding/updating price rule:", error);
      return null;
    }
  }

  /**
   * Get leads for a partner
   * @param partnerId - The partner ID
   * @param status - Optional status to filter by
   * @returns Partner leads
   */
  async getPartnerLeads(partnerId: number, status?: string): Promise<PartnerLead[]> {
    try {
      let query = sql`
        SELECT * FROM partner_leads
        WHERE partner_id = ${partnerId}
      `;
      
      if (status) {
        query = sql`
          SELECT * FROM partner_leads
          WHERE partner_id = ${partnerId} AND status = ${status}
        `;
      }
      
      const result = await db.execute(query);
      return result.rows;
    } catch (error) {
      console.error("Error getting partner leads:", error);
      return [];
    }
  }

  /**
   * Add a new lead for a partner
   * @param lead - The lead to add
   * @returns Added lead
   */
  async addLead(lead: PartnerLead): Promise<PartnerLead | null> {
    try {
      const result = await db.execute(sql`
        INSERT INTO partner_leads
        (
          partner_id, 
          user_id, 
          device_model_id, 
          estimated_value, 
          status, 
          notes, 
          assigned_staff_id, 
          created_at, 
          updated_at
        )
        VALUES (
          ${lead.partnerId}, 
          ${lead.userId || null}, 
          ${lead.deviceModelId || null}, 
          ${lead.estimatedValue || null}, 
          ${lead.status}, 
          ${lead.notes || null}, 
          ${lead.assignedStaffId || null}, 
          NOW(), 
          NOW()
        )
        RETURNING *
      `);
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error("Error adding lead:", error);
      return null;
    }
  }

  /**
   * Update a lead
   * @param leadId - The lead ID
   * @param partnerId - The partner ID (for tenant isolation)
   * @param updates - The fields to update
   * @returns Updated lead
   */
  async updateLead(leadId: number, partnerId: number, updates: Partial<PartnerLead>): Promise<PartnerLead | null> {
    try {
      // Build update query dynamically
      let setClause = 'updated_at = NOW()';
      const params: any[] = [leadId, partnerId];
      let paramIndex = 3;
      
      // Only include fields that are present in updates
      if (updates.status) {
        setClause += `, status = $${paramIndex++}`;
        params.push(updates.status);
      }
      
      if (updates.assignedStaffId !== undefined) {
        setClause += `, assigned_staff_id = $${paramIndex++}`;
        params.push(updates.assignedStaffId);
      }
      
      if (updates.notes !== undefined) {
        setClause += `, notes = $${paramIndex++}`;
        params.push(updates.notes);
      }
      
      if (updates.estimatedValue !== undefined) {
        setClause += `, estimated_value = $${paramIndex++}`;
        params.push(updates.estimatedValue);
      }
      
      const query = `
        UPDATE partner_leads
        SET ${setClause}
        WHERE id = $1 AND partner_id = $2
        RETURNING *
      `;
      
      const result = await db.execute(query, params);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error("Error updating lead:", error);
      return null;
    }
  }
}