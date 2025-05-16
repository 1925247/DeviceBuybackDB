import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { eq, sql } from "drizzle-orm";
import { partners } from "@shared/schema";

/**
 * Middleware to attach tenant context to requests
 * This ensures that all data operations are properly isolated by partner
 */
export async function tenantMiddleware(req: any, res: Response, next: NextFunction) {
  try {
    // Get partner ID from authenticated user
    // For now we're using a simple approach where partner ID is in the user object
    // In a production environment, this would come from authentication
    const partnerId = req.user?.partnerId;
    
    if (!partnerId) {
      // If no partner ID, user is likely admin or customer - proceed without tenant context
      return next();
    }

    // Check if partner exists and is active
    const [partner] = await db.select()
      .from(partners)
      .where(eq(partners.id, partnerId));
    
    if (!partner) {
      return res.status(403).json({
        message: "Partner not found or access denied"
      });
    }

    // Attach tenant context to request
    req.tenantContext = {
      partnerId,
      partnerName: partner.name,
      
      // Helper function to filter queries by partner ID
      filterByPartner: (query: any) => {
        // This will add a WHERE clause to filter by partner_id
        return query.where(eq(partners.id, partnerId));
      },
      
      // Utility to automatically append partner_id to inserted data
      withPartnerContext: (data: any) => {
        return {
          ...data,
          partnerId
        };
      }
    };
    
    next();
  } catch (error) {
    console.error("Error in tenant middleware:", error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
}

/**
 * Helper middleware that requires tenant context
 * Use this for routes that should only be accessible to partner users
 */
export function requireTenant(req: any, res: Response, next: NextFunction) {
  if (!req.tenantContext) {
    return res.status(403).json({
      message: "This route requires partner access"
    });
  }
  
  next();
}