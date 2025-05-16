import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "@shared/schema";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Tenant configuration table (will be created through migration)
const TENANT_CONFIG_TABLE = "tenant_configs";

// Cache for tenant connections
const tenantConnections = new Map<number, any>();

/**
 * Get a database connection for a specific tenant
 * @param partnerId Partner ID to get connection for
 * @returns Drizzle database instance
 */
export async function getTenantDb(partnerId: number) {
  // Return from cache if available
  if (tenantConnections.has(partnerId)) {
    return tenantConnections.get(partnerId);
  }

  try {
    // Check if tenant config exists
    const result = await db.execute(sql`
      SELECT * FROM ${sql.identifier(TENANT_CONFIG_TABLE)}
      WHERE partner_id = ${partnerId}
    `);

    if (result.rows.length === 0) {
      // If tenant doesn't exist yet, use main connection but track future operations
      console.log(`No dedicated database found for partner ${partnerId}, using main database`);
      tenantConnections.set(partnerId, db);
      return db;
    }

    const tenantConfig = result.rows[0];
    
    // Check if tenant has a separate database URL
    if (tenantConfig.database_url) {
      // Create a new connection for the tenant
      const pool = new Pool({ 
        connectionString: tenantConfig.database_url,
      });
      
      const tenantDb = drizzle(pool, { schema });
      tenantConnections.set(partnerId, tenantDb);
      return tenantDb;
    } else {
      // Use main database with tenant filtering
      tenantConnections.set(partnerId, db);
      return db;
    }
  } catch (error) {
    console.error("Error getting tenant database:", error);
    
    // Fall back to main database
    return db;
  }
}

/**
 * Create a new tenant configuration
 * @param partnerId Partner ID
 * @param databaseUrl Optional separate database URL for the tenant
 * @returns Created tenant config
 */
export async function createTenantConfig(partnerId: number, databaseUrl?: string) {
  try {
    // Check if tenant config already exists
    const existingConfig = await db.execute(sql`
      SELECT * FROM ${sql.identifier(TENANT_CONFIG_TABLE)}
      WHERE partner_id = ${partnerId}
    `);

    if (existingConfig.rows.length > 0) {
      return existingConfig.rows[0];
    }

    // Create new tenant config
    const result = await db.execute(sql`
      INSERT INTO ${sql.identifier(TENANT_CONFIG_TABLE)} 
      (partner_id, database_url, is_active, settings, created_at, updated_at)
      VALUES (${partnerId}, ${databaseUrl || null}, true, '{}', NOW(), NOW())
      RETURNING *
    `);

    return result.rows[0];
  } catch (error) {
    console.error("Error creating tenant config:", error);
    throw error;
  }
}

/**
 * Function to ensure all operations for a partner are filtered by partner_id
 * This is how we maintain tenant isolation when using the main database
 * @param partnerId Partner ID to filter by
 * @param query SQL query to execute
 * @param values Query parameter values
 * @returns Filtered query results
 */
export async function executeTenantQuery(partnerId: number, query: string, values: any[] = []) {
  try {
    // Get the appropriate database for this tenant
    const tenantDb = await getTenantDb(partnerId);
    
    // Execute the query with tenant isolation
    if (query.toLowerCase().includes('where')) {
      // Add partner_id filter to existing WHERE clause
      query = query.replace(/where/i, `WHERE partner_id = ${partnerId} AND `);
    } else if (query.toLowerCase().includes('from')) {
      // Add WHERE clause with partner_id filter
      const fromIndex = query.toLowerCase().indexOf('from');
      const restOfQuery = query.substring(fromIndex);
      
      // Find position to insert WHERE clause (after table name, before GROUP BY, ORDER BY, etc.)
      const nextClauseMatch = restOfQuery.match(/\s(group by|order by|limit|offset|having)/i);
      
      if (nextClauseMatch) {
        const insertPosition = fromIndex + nextClauseMatch.index;
        query = query.substring(0, insertPosition) + 
                ` WHERE partner_id = ${partnerId} ` + 
                query.substring(insertPosition);
      } else {
        query = query + ` WHERE partner_id = ${partnerId}`;
      }
    }
    
    // Execute the modified query
    const result = await tenantDb.execute(sql.raw(query), values);
    return result.rows;
  } catch (error) {
    console.error("Error executing tenant query:", error);
    throw error;
  }
}

/**
 * Add partner_id filtering to standard queries
 * Use this middleware for route handlers to ensure tenant data isolation
 */
export function withTenantIsolation(req: any, res: any, next: any) {
  // Get partner ID from authenticated user
  const partnerId = req.user?.partnerId;
  
  if (!partnerId) {
    // If no partner ID, proceed without tenant isolation (for admin users)
    return next();
  }
  
  // Attach tenant DB to request for use in route handlers
  req.getTenantDb = async () => await getTenantDb(partnerId);
  
  // Attach helper for tenant-isolated queries
  req.executeTenantQuery = async (query: string, values: any[] = []) => {
    return await executeTenantQuery(partnerId, query, values);
  };
  
  next();
}