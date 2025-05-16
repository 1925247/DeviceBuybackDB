import { db } from "../db";
import { featureToggles, type FeatureToggle, type InsertFeatureToggle } from "../../shared/schema";
import { eq, and, inArray } from "drizzle-orm";

// Cache for feature toggles to avoid DB queries on every check
let featureToggleCache: Record<string, FeatureToggle> = {};
let cacheLastUpdated: number = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

/**
 * Feature Toggle Service
 * Provides methods to check if features are enabled, and to manage feature toggles
 */
export class FeatureToggleService {
  /**
   * Get a list of all feature toggles
   */
  static async getAllToggles(): Promise<FeatureToggle[]> {
    return await db.select().from(featureToggles);
  }

  /**
   * Get feature toggles by category
   */
  static async getTogglesByCategory(category: string): Promise<FeatureToggle[]> {
    return await db.select().from(featureToggles).where(eq(featureToggles.category, category));
  }

  /**
   * Get a specific feature toggle by key
   */
  static async getToggleByKey(featureKey: string): Promise<FeatureToggle | undefined> {
    const [toggle] = await db.select().from(featureToggles).where(eq(featureToggles.featureKey, featureKey));
    return toggle;
  }

  /**
   * Create a new feature toggle
   */
  static async createToggle(toggle: InsertFeatureToggle): Promise<FeatureToggle> {
    const [newToggle] = await db.insert(featureToggles).values(toggle).returning();
    this.invalidateCache();
    return newToggle;
  }

  /**
   * Update an existing feature toggle
   */
  static async updateToggle(id: number, toggle: Partial<InsertFeatureToggle>): Promise<FeatureToggle | undefined> {
    const [updatedToggle] = await db
      .update(featureToggles)
      .set(toggle)
      .where(eq(featureToggles.id, id))
      .returning();
    
    this.invalidateCache();
    return updatedToggle;
  }

  /**
   * Enable or disable a feature toggle
   */
  static async setToggleState(featureKey: string, isEnabled: boolean, userId: number): Promise<FeatureToggle | undefined> {
    const [updatedToggle] = await db
      .update(featureToggles)
      .set({ 
        isEnabled,
        lastModifiedBy: userId,
        lastModifiedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(featureToggles.featureKey, featureKey))
      .returning();
    
    this.invalidateCache();
    return updatedToggle;
  }

  /**
   * Delete a feature toggle
   */
  static async deleteToggle(id: number): Promise<void> {
    await db.delete(featureToggles).where(eq(featureToggles.id, id));
    this.invalidateCache();
  }

  /**
   * Check if a feature is enabled
   * @param featureKey The unique key for the feature
   * @param scopeId Optional scope ID for tenant/partner/region-specific toggles
   */
  static async isFeatureEnabled(featureKey: string, scopeId?: number): Promise<boolean> {
    await this.refreshCacheIfNeeded();
    
    const toggle = featureToggleCache[featureKey];
    if (!toggle) {
      console.warn(`Feature toggle '${featureKey}' not found`);
      return false; // Feature not found, assume disabled
    }

    // If toggle has a specific scope and a scopeId is provided, check if they match
    if (toggle.scope !== 'global' && scopeId && toggle.scopeId !== scopeId) {
      return false; // This toggle doesn't apply to the provided scope
    }

    return toggle.isEnabled;
  }

  /**
   * Initialize default feature toggles if they don't exist
   */
  static async initializeDefaultToggles(userId: number): Promise<void> {
    const defaultToggles: InsertFeatureToggle[] = [
      {
        featureKey: 'marketplace_enabled',
        displayName: 'Marketplace',
        description: 'Enable the marketplace feature for customers to buy and sell devices',
        isEnabled: true,
        category: 'marketplace',
        scope: 'global',
        lastModifiedBy: userId
      },
      {
        featureKey: 'email_notifications',
        displayName: 'Email Notifications',
        description: 'Send email notifications for various events',
        isEnabled: false,
        category: 'notifications',
        scope: 'global',
        lastModifiedBy: userId
      },
      {
        featureKey: 'buyback_enabled',
        displayName: 'Device Buyback',
        description: 'Enable the device buyback feature',
        isEnabled: true,
        category: 'buyback',
        scope: 'global',
        lastModifiedBy: userId
      },
      {
        featureKey: 'partner_portal',
        displayName: 'Partner Portal',
        description: 'Enable the partner portal for businesses',
        isEnabled: true,
        category: 'partners',
        scope: 'global',
        lastModifiedBy: userId
      },
      {
        featureKey: 'shop_now_button',
        displayName: 'Shop Now Button',
        description: 'Show the Shop Now button on the homepage',
        isEnabled: true,
        category: 'ui',
        scope: 'global',
        lastModifiedBy: userId
      }
    ];

    // Check if each toggle exists, create if not
    for (const toggle of defaultToggles) {
      const existing = await this.getToggleByKey(toggle.featureKey);
      if (!existing) {
        await this.createToggle(toggle);
      }
    }

    this.invalidateCache();
  }

  /**
   * Invalidate the cache to force reload
   */
  private static invalidateCache(): void {
    featureToggleCache = {};
    cacheLastUpdated = 0;
  }

  /**
   * Refresh the cache if needed
   */
  private static async refreshCacheIfNeeded(): Promise<void> {
    const now = Date.now();
    if (now - cacheLastUpdated > CACHE_TTL || Object.keys(featureToggleCache).length === 0) {
      const toggles = await this.getAllToggles();
      
      featureToggleCache = toggles.reduce((acc, toggle) => {
        acc[toggle.featureKey] = toggle;
        return acc;
      }, {} as Record<string, FeatureToggle>);
      
      cacheLastUpdated = now;
    }
  }
}