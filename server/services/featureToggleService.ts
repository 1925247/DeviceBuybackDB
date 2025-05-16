import { db } from "../db";
import { eq, and, sql } from "drizzle-orm";
import { featureToggles } from "@shared/schema";

interface ToggleStatus {
  isEnabled: boolean;
  featureKey: string;
}

export interface FeatureToggle {
  id: number;
  featureKey: string;
  displayName: string;
  description: string;
  isEnabled: boolean;
  category: string;
  scope: string;
  scopeId?: number | null;
  lastModifiedBy?: number | null;
  lastModifiedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Default toggles for system initialization
const defaultToggles = [
  {
    featureKey: "email_marketplace",
    displayName: "Email Marketplace",
    description: "Enable email notifications for marketplace activity and listings",
    isEnabled: false,
    category: "notifications",
    scope: "global",
  },
  {
    featureKey: "shop_now_button",
    displayName: "Shop Now Button",
    description: "Show the 'Shop Now' button on homepage and product listings",
    isEnabled: true,
    category: "ui",
    scope: "global",
  },
  {
    featureKey: "partner_wallet",
    displayName: "Partner Wallet",
    description: "Enable partner wallet functionality for managing commissions and payments",
    isEnabled: true,
    category: "partners",
    scope: "global",
  },
  {
    featureKey: "buyback_valuation",
    displayName: "Buyback Valuation System",
    description: "Enable the dynamic device valuation system for the buyback process",
    isEnabled: true,
    category: "buyback",
    scope: "global",
  },
  {
    featureKey: "marketplace_listing",
    displayName: "Marketplace Listing",
    description: "Allow users to create marketplace listings for devices",
    isEnabled: true,
    category: "marketplace",
    scope: "global",
  },
  {
    featureKey: "regional_pricing",
    displayName: "Regional Pricing",
    description: "Enable region-specific pricing for devices and products",
    isEnabled: false,
    category: "marketplace",
    scope: "global",
  }
];

// Get all feature toggles
export async function getAllFeatureToggles(): Promise<FeatureToggle[]> {
  try {
    return await db.select().from(featureToggles).orderBy(featureToggles.category, featureToggles.displayName);
  } catch (error) {
    console.error("Error getting all feature toggles:", error);
    throw error;
  }
}

// Get feature toggles by category
export async function getFeatureTogglesByCategory(category: string): Promise<FeatureToggle[]> {
  try {
    return await db
      .select()
      .from(featureToggles)
      .where(eq(featureToggles.category, category))
      .orderBy(featureToggles.displayName);
  } catch (error) {
    console.error(`Error getting feature toggles for category ${category}:`, error);
    throw error;
  }
}

// Get a specific feature toggle by key
export async function getFeatureToggleByKey(featureKey: string): Promise<FeatureToggle | null> {
  try {
    const [toggle] = await db
      .select()
      .from(featureToggles)
      .where(eq(featureToggles.featureKey, featureKey));
    
    return toggle || null;
  } catch (error) {
    console.error(`Error getting feature toggle ${featureKey}:`, error);
    throw error;
  }
}

// Create a new feature toggle
export async function createFeatureToggle(toggle: Omit<FeatureToggle, 'id' | 'createdAt' | 'updatedAt'>): Promise<FeatureToggle> {
  try {
    // Check if toggle with this key already exists
    const existingToggle = await getFeatureToggleByKey(toggle.featureKey);
    if (existingToggle) {
      throw new Error(`Feature toggle with key '${toggle.featureKey}' already exists`);
    }
    
    const [newToggle] = await db
      .insert(featureToggles)
      .values({
        ...toggle,
        lastModifiedAt: new Date(),
      })
      .returning();
    
    return newToggle;
  } catch (error) {
    console.error("Error creating feature toggle:", error);
    throw error;
  }
}

// Update an existing feature toggle
export async function updateFeatureToggle(id: number, toggle: Partial<FeatureToggle>): Promise<FeatureToggle | null> {
  try {
    const [updatedToggle] = await db
      .update(featureToggles)
      .set({
        ...toggle,
        updatedAt: new Date(),
        lastModifiedAt: new Date(),
      })
      .where(eq(featureToggles.id, id))
      .returning();
    
    return updatedToggle || null;
  } catch (error) {
    console.error(`Error updating feature toggle ${id}:`, error);
    throw error;
  }
}

// Toggle a feature on/off
export async function toggleFeature(featureKey: string, isEnabled: boolean, userId?: number): Promise<ToggleStatus | null> {
  try {
    const [updatedToggle] = await db
      .update(featureToggles)
      .set({
        isEnabled,
        lastModifiedBy: userId || null,
        lastModifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(featureToggles.featureKey, featureKey))
      .returning({ featureKey: featureToggles.featureKey, isEnabled: featureToggles.isEnabled });
    
    return updatedToggle || null;
  } catch (error) {
    console.error(`Error toggling feature ${featureKey}:`, error);
    throw error;
  }
}

// Delete a feature toggle
export async function deleteFeatureToggle(id: number): Promise<boolean> {
  try {
    const result = await db
      .delete(featureToggles)
      .where(eq(featureToggles.id, id))
      .returning({ id: featureToggles.id });
    
    return result.length > 0;
  } catch (error) {
    console.error(`Error deleting feature toggle ${id}:`, error);
    throw error;
  }
}

// Check if a feature is enabled
export async function isFeatureEnabled(featureKey: string, scope?: string, scopeId?: number): Promise<boolean> {
  try {
    let query = db
      .select({ isEnabled: featureToggles.isEnabled })
      .from(featureToggles)
      .where(eq(featureToggles.featureKey, featureKey));
    
    if (scope) {
      query = query.where(eq(featureToggles.scope, scope));
      
      if (scopeId) {
        query = query.where(eq(featureToggles.scopeId, scopeId));
      }
    }
    
    const [result] = await query;
    return result?.isEnabled || false;
  } catch (error) {
    console.error(`Error checking if feature ${featureKey} is enabled:`, error);
    return false;
  }
}

// Initialize default feature toggles
export async function initializeDefaultToggles(userId?: number): Promise<FeatureToggle[]> {
  const createdToggles: FeatureToggle[] = [];
  
  try {
    for (const toggle of defaultToggles) {
      // Skip if toggle already exists
      const existingToggle = await getFeatureToggleByKey(toggle.featureKey);
      if (existingToggle) {
        createdToggles.push(existingToggle);
        continue;
      }
      
      // Create the toggle
      const newToggle = await createFeatureToggle({
        ...toggle,
        lastModifiedBy: userId,
        lastModifiedAt: new Date(),
      });
      
      createdToggles.push(newToggle);
    }
    
    return createdToggles;
  } catch (error) {
    console.error("Error initializing default feature toggles:", error);
    throw error;
  }
}