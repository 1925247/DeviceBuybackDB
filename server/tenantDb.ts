import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import * as tenantSchema from "@shared/tenantSchema";
import { db as mainDb } from "./db";
import { eq } from "drizzle-orm";

// Configure neon with websocket
neonConfig.webSocketConstructor = ws;

// Map to store tenant database connections
const tenantConnections = new Map<number, any>();

/**
 * Get a tenant's database connection
 * @param partnerId - The partner ID for the tenant
 * @returns Drizzle DB instance for the tenant
 */
export async function getTenantDb(partnerId: number) {
  // If connection already exists in cache, return it
  if (tenantConnections.has(partnerId)) {
    return tenantConnections.get(partnerId);
  }

  // Fetch tenant configuration from the main database
  const [tenantConfig] = await mainDb
    .select()
    .from(tenantSchema.tenantConfigs)
    .where(eq(tenantSchema.tenantConfigs.partnerId, partnerId));

  if (!tenantConfig) {
    throw new Error(`No tenant configuration found for partner ID: ${partnerId}`);
  }

  if (!tenantConfig.isActive) {
    throw new Error(`Tenant with partner ID: ${partnerId} is inactive`);
  }

  // Determine which database URL to use
  const dbUrl = tenantConfig.databaseUrl || process.env.DATABASE_URL;
  
  if (!dbUrl) {
    throw new Error(`No database URL available for tenant with partner ID: ${partnerId}`);
  }

  // Create a connection to the tenant's database
  const pool = new Pool({ 
    connectionString: dbUrl,
  });

  // Create a Drizzle instance with the tenant's schema
  const tenantDb = drizzle(pool, { 
    schema,
    // We'll manage schema prefixing at the query level instead
  });

  // Cache the connection
  tenantConnections.set(partnerId, tenantDb);
  
  return tenantDb;
}

/**
 * Clear a tenant's database connection from the cache
 * @param partnerId - The partner ID for the tenant
 */
export function clearTenantConnection(partnerId: number) {
  if (tenantConnections.has(partnerId)) {
    tenantConnections.delete(partnerId);
  }
}

/**
 * Clear all tenant database connections from the cache
 */
export function clearAllTenantConnections() {
  tenantConnections.clear();
}

/**
 * Create a new tenant configuration
 * @param partnerId - The partner ID for the tenant
 * @param schemaName - The schema name for the tenant
 * @param databaseUrl - Optional custom database URL for the tenant
 * @returns The created tenant configuration
 */
export async function createTenantConfig(partnerId: number, schemaName: string, databaseUrl?: string) {
  const [existingConfig] = await mainDb
    .select()
    .from(tenantSchema.tenantConfigs)
    .where(eq(tenantSchema.tenantConfigs.partnerId, partnerId));

  if (existingConfig) {
    throw new Error(`Tenant configuration already exists for partner ID: ${partnerId}`);
  }

  // Create a new tenant configuration
  const [tenantConfig] = await mainDb
    .insert(tenantSchema.tenantConfigs)
    .values({
      partnerId,
      schemaName,
      databaseUrl,
      isActive: true,
      settings: {},
    })
    .returning();

  return tenantConfig;
}

/**
 * Initialize the tenant's database schema
 * @param partnerId - The partner ID for the tenant
 */
export async function initializeTenantSchema(partnerId: number) {
  // Get the tenant configuration
  const [tenantConfig] = await mainDb
    .select()
    .from(tenantSchema.tenantConfigs)
    .where(eq(tenantSchema.tenantConfigs.partnerId, partnerId));

  if (!tenantConfig) {
    throw new Error(`No tenant configuration found for partner ID: ${partnerId}`);
  }

  // Get the tenant's database connection
  const tenantDb = await getTenantDb(partnerId);
  
  // If using a separate database URL, we may need to create schemas or tables
  if (tenantConfig.databaseUrl) {
    // Execute schema creation SQL
    await tenantDb.execute(`CREATE SCHEMA IF NOT EXISTS ${tenantConfig.schemaName}`);
    
    // Here we could also execute table creation SQL if needed
    // This would depend on which tables we want to be tenant-specific
  }

  return tenantConfig;
}