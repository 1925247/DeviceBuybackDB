import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import * as tenantUtils from "@shared/tenantUtils";
import * as schema from "@shared/schema";

/**
 * Tenant Manager class to handle tenant-specific operations
 */
export class TenantManager {
  private tenantConfig: tenantUtils.TenantConfig | null = null;
  private partnerId: number;

  /**
   * Create a new tenant manager instance
   * @param partnerId - The partner ID for the tenant
   */
  constructor(partnerId: number) {
    this.partnerId = partnerId;
  }

  /**
   * Initialize the tenant manager by loading tenant configuration
   */
  async initialize(): Promise<boolean> {
    try {
      // Get tenant configuration from database
      const [config] = await db
        .select()
        .from(tenantUtils.tenantConfigs)
        .where(eq(tenantUtils.tenantConfigs.partnerId, this.partnerId));

      if (!config) {
        console.error(`No tenant configuration found for partner ID: ${this.partnerId}`);
        return false;
      }

      if (!config.isActive) {
        console.error(`Tenant with partner ID: ${this.partnerId} is inactive`);
        return false;
      }

      this.tenantConfig = config;
      return true;
    } catch (error) {
      console.error(`Error initializing tenant manager for partner ID: ${this.partnerId}`, error);
      return false;
    }
  }

  /**
   * Get the tenant configuration
   */
  getTenantConfig(): tenantUtils.TenantConfig | null {
    return this.tenantConfig;
  }

  /**
   * Create a new tenant configuration
   * @param tablePrefix - Optional custom table prefix for the tenant (defaults to p{partnerId})
   * @param settings - Optional custom settings for the tenant
   */
  async createTenantConfig(tablePrefix?: string, settings?: any): Promise<tenantUtils.TenantConfig> {
    // Check if tenant config already exists
    const [existingConfig] = await db
      .select()
      .from(tenantUtils.tenantConfigs)
      .where(eq(tenantUtils.tenantConfigs.partnerId, this.partnerId));

    if (existingConfig) {
      throw new Error(`Tenant configuration already exists for partner ID: ${this.partnerId}`);
    }

    // Use the provided table prefix or generate a default one
    const prefix = tablePrefix || tenantUtils.generateTablePrefix(this.partnerId);

    // Create a new tenant configuration
    const [config] = await db
      .insert(tenantUtils.tenantConfigs)
      .values({
        partnerId: this.partnerId,
        tablePrefix: prefix,
        isActive: true,
        settings: settings || {},
      })
      .returning();

    this.tenantConfig = config;
    return config;
  }

  /**
   * Create the necessary tenant-specific tables in the database
   */
  async createTenantTables(): Promise<boolean> {
    if (!this.tenantConfig) {
      throw new Error("Tenant configuration not initialized");
    }

    const prefix = this.tenantConfig.tablePrefix;

    try {
      // Create tenant-specific inventory tables
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS ${sql.raw(tenantUtils.getTenantTableName(prefix, "inventory"))} (
          id SERIAL PRIMARY KEY,
          device_model_id INTEGER NOT NULL REFERENCES device_models(id),
          condition TEXT NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 0,
          price REAL NOT NULL,
          partner_id INTEGER NOT NULL REFERENCES partners(id),
          is_available BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);

      // Create tenant-specific price rules tables
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS ${sql.raw(tenantUtils.getTenantTableName(prefix, "price_rules"))} (
          id SERIAL PRIMARY KEY,
          device_model_id INTEGER NOT NULL REFERENCES device_models(id),
          condition_factor REAL NOT NULL DEFAULT 1.0,
          base_price REAL NOT NULL,
          min_price REAL NOT NULL,
          max_price REAL NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          partner_id INTEGER NOT NULL REFERENCES partners(id),
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);

      // Create tenant-specific customer leads tables
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS ${sql.raw(tenantUtils.getTenantTableName(prefix, "customer_leads"))} (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          device_model_id INTEGER REFERENCES device_models(id),
          estimated_value REAL,
          status TEXT NOT NULL DEFAULT 'new',
          notes TEXT,
          partner_id INTEGER NOT NULL REFERENCES partners(id),
          assigned_staff_id INTEGER REFERENCES partner_staff(id),
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);

      return true;
    } catch (error) {
      console.error(`Error creating tenant tables for partner ID: ${this.partnerId}`, error);
      return false;
    }
  }

  /**
   * Get items from a tenant-specific table
   * @param tableName - The base table name without prefix
   * @param conditions - Optional where conditions
   */
  async getTenantItems(tableName: string, conditions?: any): Promise<any[]> {
    if (!this.tenantConfig) {
      throw new Error("Tenant configuration not initialized");
    }

    const fullTableName = tenantUtils.getTenantTableName(this.tenantConfig.tablePrefix, tableName);

    try {
      // Build a dynamic query
      let query = `SELECT * FROM ${fullTableName}`;
      
      if (conditions) {
        query += " WHERE ";
        const conditionParts = [];
        
        for (const [key, value] of Object.entries(conditions)) {
          conditionParts.push(`${key} = '${value}'`);
        }
        
        query += conditionParts.join(" AND ");
      }

      const result = await db.execute(query);
      return result.rows as any[];
    } catch (error) {
      console.error(`Error getting items from tenant table ${fullTableName}`, error);
      return [];
    }
  }

  /**
   * Insert an item into a tenant-specific table
   * @param tableName - The base table name without prefix
   * @param data - The data to insert
   */
  async insertTenantItem(tableName: string, data: any): Promise<any> {
    if (!this.tenantConfig) {
      throw new Error("Tenant configuration not initialized");
    }

    const fullTableName = tenantUtils.getTenantTableName(this.tenantConfig.tablePrefix, tableName);

    try {
      // Add partner_id to the data if it's not already there
      const dataWithPartnerId = {
        ...data,
        partner_id: this.partnerId,
      };

      // Build a dynamic query
      const columns = Object.keys(dataWithPartnerId).join(", ");
      const placeholders = Object.keys(dataWithPartnerId)
        .map((_, i) => `$${i + 1}`)
        .join(", ");

      const query = `
        INSERT INTO ${fullTableName} (${columns})
        VALUES (${placeholders})
        RETURNING *
      `;

      const values = Object.values(dataWithPartnerId);
      const result = await db.execute(query, values);
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error inserting item into tenant table ${fullTableName}`, error);
      throw error;
    }
  }

  /**
   * Update an item in a tenant-specific table
   * @param tableName - The base table name without prefix
   * @param id - The ID of the item to update
   * @param data - The data to update
   */
  async updateTenantItem(tableName: string, id: number, data: any): Promise<any> {
    if (!this.tenantConfig) {
      throw new Error("Tenant configuration not initialized");
    }

    const fullTableName = tenantUtils.getTenantTableName(this.tenantConfig.tablePrefix, tableName);

    try {
      // Build a dynamic query
      const updateParts = Object.entries(data)
        .map(([key, _], i) => `${key} = $${i + 2}`)
        .join(", ");

      const query = `
        UPDATE ${fullTableName}
        SET ${updateParts}, updated_at = NOW()
        WHERE id = $1 AND partner_id = ${this.partnerId}
        RETURNING *
      `;

      const values = [id, ...Object.values(data)];
      const result = await db.execute(query, values);
      
      if (result.rows.length === 0) {
        throw new Error(`Item with ID ${id} not found in table ${fullTableName}`);
      }
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error updating item in tenant table ${fullTableName}`, error);
      throw error;
    }
  }

  /**
   * Delete an item from a tenant-specific table
   * @param tableName - The base table name without prefix
   * @param id - The ID of the item to delete
   */
  async deleteTenantItem(tableName: string, id: number): Promise<boolean> {
    if (!this.tenantConfig) {
      throw new Error("Tenant configuration not initialized");
    }

    const fullTableName = tenantUtils.getTenantTableName(this.tenantConfig.tablePrefix, tableName);

    try {
      const query = `
        DELETE FROM ${fullTableName}
        WHERE id = $1 AND partner_id = ${this.partnerId}
        RETURNING id
      `;

      const result = await db.execute(query, [id]);
      
      return result.rows.length > 0;
    } catch (error) {
      console.error(`Error deleting item from tenant table ${fullTableName}`, error);
      return false;
    }
  }
}