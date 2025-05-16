import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '@shared/schema';
import { db } from './db';
import { eq } from 'drizzle-orm';

/**
 * Tenant Database Manager
 * 
 * This module handles multi-tenant database connections for partner-specific data.
 * Each partner can be configured to have their own database or share the main database.
 */

// Cache of tenant database connections
type TenantConnection = {
  pool: Pool;
  db: ReturnType<typeof drizzle>;
  lastUsed: Date;
};

const tenantConnections = new Map<number, TenantConnection>();

// Clean up unused connections every hour
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
const CONNECTION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get a database connection for a specific tenant
 */
export async function getTenantDb(partnerId: number): Promise<ReturnType<typeof drizzle>> {
  // Check if we already have a connection for this tenant
  const existingConnection = tenantConnections.get(partnerId);
  if (existingConnection) {
    existingConnection.lastUsed = new Date();
    return existingConnection.db;
  }

  // Get tenant configuration
  const [tenantConfig] = await db.select()
    .from(schema.tenantConfigurations)
    .where(eq(schema.tenantConfigurations.partnerId, partnerId));

  // If no tenant configuration or not multi-tenant, use the main database
  if (!tenantConfig || !tenantConfig.isMultiTenant) {
    return db;
  }

  // Create a new connection
  try {
    const connectionString = constructConnectionString(tenantConfig);
    const pool = new Pool({ connectionString });
    const tenantDb = drizzle(pool, { schema });
    
    // Store connection in cache
    tenantConnections.set(partnerId, {
      pool,
      db: tenantDb,
      lastUsed: new Date()
    });
    
    return tenantDb;
  } catch (error) {
    console.error(`Error connecting to tenant database for partner ${partnerId}:`, error);
    // Fall back to main database
    return db;
  }
}

/**
 * Construct database connection string from tenant configuration
 */
function constructConnectionString(config: schema.TenantConfiguration): string {
  const { databaseUser, databasePassword, databaseHost, databasePort, databaseName } = config;
  
  if (!databaseHost || !databaseName) {
    throw new Error('Incomplete database configuration');
  }
  
  return `postgres://${databaseUser}:${databasePassword}@${databaseHost}:${databasePort || 5432}/${databaseName}`;
}

/**
 * Close all tenant database connections
 */
export async function closeTenantConnections(): Promise<void> {
  for (const [partnerId, connection] of tenantConnections.entries()) {
    try {
      await connection.pool.end();
      console.log(`Closed database connection for partner ${partnerId}`);
    } catch (error) {
      console.error(`Error closing database connection for partner ${partnerId}:`, error);
    }
  }
  tenantConnections.clear();
}

/**
 * Clean up unused tenant database connections
 */
export function cleanupTenantConnections(): void {
  const now = new Date();
  
  for (const [partnerId, connection] of tenantConnections.entries()) {
    const timeSinceLastUse = now.getTime() - connection.lastUsed.getTime();
    
    if (timeSinceLastUse > CONNECTION_TIMEOUT) {
      connection.pool.end().catch(error => {
        console.error(`Error closing database connection for partner ${partnerId}:`, error);
      });
      tenantConnections.delete(partnerId);
      console.log(`Cleaned up unused database connection for partner ${partnerId}`);
    }
  }
}

// Set up periodic cleanup
setInterval(cleanupTenantConnections, CLEANUP_INTERVAL);

// Clean up on process exit
process.on('beforeExit', async () => {
  await closeTenantConnections();
});