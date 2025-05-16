import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { partners } from "@shared/schema";

/**
 * Middleware to add tenant context to requests
 * This applies partner filtering to all database operations
 */
export function tenantMiddleware(req: any, res: Response, next: NextFunction) {
  // If user is authenticated and has a partner ID, set up tenant context
  if (req.user && req.user.partnerId) {
    const partnerId = req.user.partnerId;
    
    // Add tenant context to request
    req.tenantContext = {
      partnerId,
      
      // Helper to add tenant filtering to queries
      withTenant: function(query: any) {
        return query.where(eq(partners.id, partnerId));
      },
      
      // Helper to add tenant ID to objects
      addTenantId: function(obj: any) {
        return {
          ...obj,
          partnerId
        };
      }
    };
  }
  
  next();
}

/**
 * Helper function to append tenant ID to objects
 * @param data Data to modify 
 * @param partnerId Partner ID (tenant ID)
 * @returns Data with tenant ID
 */
export function addTenantId<T>(data: T, partnerId: number): T & { partnerId: number } {
  return {
    ...data as any,
    partnerId
  };
}

/**
 * Middleware to ensure tenant context is present
 * Use this to protect routes that require tenant context
 */
export function requireTenant(req: any, res: Response, next: NextFunction) {
  if (!req.tenantContext) {
    return res.status(403).json({
      message: "Access denied - tenant context required"
    });
  }
  
  next();
}

/**
 * Get data for a specific tenant
 * @param tableName Table to query
 * @param partnerId Partner ID
 * @returns Data for tenant
 */
export async function getTenantData(tableName: string, partnerId: number) {
  try {
    const sqlQuery = `
      SELECT * FROM ${tableName} 
      WHERE partner_id = ${partnerId}
    `;
    
    const result = await db.execute(sqlQuery);
    return result.rows;
  } catch (error) {
    console.error(`Error fetching tenant data from ${tableName}:`, error);
    return [];
  }
}

/**
 * Insert data for a specific tenant
 * @param tableName Table to insert into
 * @param data Data to insert (must include partnerId)
 * @returns Inserted data
 */
export async function insertTenantData(tableName: string, data: any) {
  try {
    if (!data.partnerId) {
      throw new Error("Partner ID is required for tenant data");
    }
    
    const columns = Object.keys(data).join(", ");
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
    
    const sqlQuery = `
      INSERT INTO ${tableName} (${columns})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    const result = await db.execute(sqlQuery, values);
    return result.rows[0];
  } catch (error) {
    console.error(`Error inserting tenant data into ${tableName}:`, error);
    throw error;
  }
}

/**
 * Update data for a specific tenant
 * @param tableName Table to update
 * @param id ID of record to update
 * @param data Data to update
 * @param partnerId Partner ID
 * @returns Updated data
 */
export async function updateTenantData(tableName: string, id: number, data: any, partnerId: number) {
  try {
    const updateColumns = Object.entries(data)
      .map(([key, _], i) => `${key} = $${i + 3}`)
      .join(", ");
    
    const sqlQuery = `
      UPDATE ${tableName}
      SET ${updateColumns}
      WHERE id = $1 AND partner_id = $2
      RETURNING *
    `;
    
    const values = [id, partnerId, ...Object.values(data)];
    const result = await db.execute(sqlQuery, values);
    
    if (result.rows.length === 0) {
      throw new Error(`Record not found or access denied`);
    }
    
    return result.rows[0];
  } catch (error) {
    console.error(`Error updating tenant data in ${tableName}:`, error);
    throw error;
  }
}

/**
 * Delete data for a specific tenant
 * @param tableName Table to delete from
 * @param id ID of record to delete
 * @param partnerId Partner ID
 * @returns Success status
 */
export async function deleteTenantData(tableName: string, id: number, partnerId: number) {
  try {
    const sqlQuery = `
      DELETE FROM ${tableName}
      WHERE id = $1 AND partner_id = $2
      RETURNING id
    `;
    
    const result = await db.execute(sqlQuery, [id, partnerId]);
    return result.rows.length > 0;
  } catch (error) {
    console.error(`Error deleting tenant data from ${tableName}:`, error);
    throw error;
  }
}