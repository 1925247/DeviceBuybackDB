const { db } = require('../db');
const { eq, and, inArray, like } = require('drizzle-orm');
const { partners, users, regions, deviceTypes, buybackRequests } = require('../../shared/schema');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

/**
 * Gets all partners
 * @param {boolean} activeOnly - Whether to return active partners only
 * @returns {Promise<array>} - Array of partners
 */
async function getAllPartners(activeOnly = true) {
  try {
    let query = db.select().from(partners);
    
    if (activeOnly) {
      query = query.where(eq(partners.status, 'active'));
    }
    
    return await query.orderBy(partners.name);
    
  } catch (error) {
    console.error('Error fetching partners:', error);
    throw error;
  }
}

/**
 * Gets a partner by ID
 * @param {number} partnerId - ID of the partner
 * @returns {Promise<object>} - Partner data
 */
async function getPartnerById(partnerId) {
  try {
    const [partner] = await db
      .select()
      .from(partners)
      .where(eq(partners.id, partnerId));
    
    if (!partner) {
      throw new Error(`Partner with ID ${partnerId} not found`);
    }
    
    return partner;
    
  } catch (error) {
    console.error('Error fetching partner by ID:', error);
    throw error;
  }
}

/**
 * Gets a partner by email
 * @param {string} email - Email of the partner
 * @returns {Promise<object>} - Partner data
 */
async function getPartnerByEmail(email) {
  try {
    const [partner] = await db
      .select()
      .from(partners)
      .where(eq(partners.email, email));
    
    return partner;
    
  } catch (error) {
    console.error('Error fetching partner by email:', error);
    throw error;
  }
}

/**
 * Gets a partner by tenant ID
 * @param {string} tenantId - Tenant ID of the partner
 * @returns {Promise<object>} - Partner data
 */
async function getPartnerByTenantId(tenantId) {
  try {
    const [partner] = await db
      .select()
      .from(partners)
      .where(eq(partners.tenant_id, tenantId));
    
    return partner;
    
  } catch (error) {
    console.error('Error fetching partner by tenant ID:', error);
    throw error;
  }
}

/**
 * Creates a new partner
 * @param {object} partnerData - Partner data
 * @returns {Promise<object>} - Created partner
 */
async function createPartner(partnerData) {
  try {
    // Check if email already exists
    const existingPartner = await getPartnerByEmail(partnerData.email);
    if (existingPartner) {
      throw new Error('Partner with this email already exists');
    }
    
    // Generate a unique tenant ID
    const tenantId = `tenant-${crypto.randomUUID().slice(0, 8)}`;
    
    // Create the partner
    const [partner] = await db
      .insert(partners)
      .values({
        name: partnerData.name,
        email: partnerData.email,
        phone: partnerData.phone,
        address: partnerData.address,
        logo: partnerData.logo,
        status: partnerData.status || 'active',
        specialization: partnerData.specialization,
        regions: partnerData.regions || [],
        device_types: partnerData.deviceTypes || [],
        pin_codes: partnerData.pinCodes || [],
        commission_rate: partnerData.commissionRate || 10,
        tenant_id: tenantId,
      })
      .returning();
    
    // Create a user for the partner if email and password provided
    if (partnerData.userPassword) {
      await db
        .insert(users)
        .values({
          email: partnerData.email,
          password_hash: await bcrypt.hash(partnerData.userPassword, 10),
          name: partnerData.name,
          role: 'partner',
          status: 'active',
          partner_id: partner.id,
        });
    }
    
    return partner;
    
  } catch (error) {
    console.error('Error creating partner:', error);
    throw error;
  }
}

/**
 * Updates a partner
 * @param {number} partnerId - ID of the partner to update
 * @param {object} partnerData - Updated partner data
 * @returns {Promise<object>} - Updated partner
 */
async function updatePartner(partnerId, partnerData) {
  try {
    const [partner] = await db
      .update(partners)
      .set({
        name: partnerData.name,
        phone: partnerData.phone,
        address: partnerData.address,
        logo: partnerData.logo,
        status: partnerData.status,
        specialization: partnerData.specialization,
        regions: partnerData.regions,
        device_types: partnerData.deviceTypes,
        pin_codes: partnerData.pinCodes,
        commission_rate: partnerData.commissionRate,
        updated_at: new Date(),
      })
      .where(eq(partners.id, partnerId))
      .returning();
    
    if (!partner) {
      throw new Error(`Partner with ID ${partnerId} not found`);
    }
    
    return partner;
    
  } catch (error) {
    console.error('Error updating partner:', error);
    throw error;
  }
}

/**
 * Disables a partner (soft delete)
 * @param {number} partnerId - ID of the partner to disable
 * @returns {Promise<boolean>} - Success status
 */
async function disablePartner(partnerId) {
  try {
    const [partner] = await db
      .update(partners)
      .set({
        status: 'disabled',
        updated_at: new Date(),
      })
      .where(eq(partners.id, partnerId))
      .returning();
    
    return !!partner;
    
  } catch (error) {
    console.error('Error disabling partner:', error);
    throw error;
  }
}

/**
 * Assigns a device buyback request to a partner based on PIN code
 * @param {object} buybackData - Buyback request data with pinCode
 * @returns {Promise<object>} - Partner assignment result
 */
async function assignBuybackToPartner(buybackData) {
  try {
    // Validate inputs
    if (!buybackData.pinCode) {
      throw new Error('PIN code is required for partner assignment');
    }
    
    // Find partners that handle this PIN code
    const partnersList = await db.query(`
      SELECT * FROM partners 
      WHERE status = 'active' 
      AND pin_codes @> ARRAY['${buybackData.pinCode}']::text[]
      ORDER BY id
    `);
    
    if (!partnersList.length) {
      return { 
        assigned: false, 
        message: 'No partners available for this PIN code',
        buybackData 
      };
    }
    
    // Assign to the first matching partner for now
    // In a more advanced implementation, we could use a round-robin or load-balanced approach
    const assignedPartner = partnersList[0];
    
    // Update the buyback request with the partner ID
    let buybackId = buybackData.id;
    
    if (buybackId) {
      // Update existing buyback request
      await db
        .update(buybackRequests)
        .set({
          partner_id: assignedPartner.id,
          pin_code: buybackData.pinCode,
          updated_at: new Date(),
        })
        .where(eq(buybackRequests.id, buybackId));
    }
    
    return {
      assigned: true,
      partnerId: assignedPartner.id,
      partnerName: assignedPartner.name,
      partnerEmail: assignedPartner.email,
      buybackData
    };
    
  } catch (error) {
    console.error('Error assigning buyback to partner:', error);
    throw error;
  }
}

/**
 * Gets all buyback requests for a specific partner
 * @param {number} partnerId - ID of the partner
 * @param {object} options - Filtering options
 * @returns {Promise<array>} - Array of buyback requests
 */
async function getPartnerBuybackRequests(partnerId, options = {}) {
  try {
    // Get all buyback requests assigned to this partner
    let query = db
      .select({
        id: buybackRequests.id,
        customerId: buybackRequests.customer_id, 
        deviceModelId: buybackRequests.device_model_id,
        deviceId: buybackRequests.device_id,
        status: buybackRequests.status,
        offeredPrice: buybackRequests.offered_price,
        customerName: buybackRequests.customer_name,
        customerEmail: buybackRequests.customer_email,
        customerPhone: buybackRequests.customer_phone,
        customerAddress: buybackRequests.customer_address,
        pinCode: buybackRequests.pin_code,
        partnerId: buybackRequests.partner_id,
        regionId: buybackRequests.region_id,
        createdAt: buybackRequests.created_at,
        updatedAt: buybackRequests.updated_at,
      })
      .from(buybackRequests)
      .where(eq(buybackRequests.partner_id, partnerId))
      .orderBy(buybackRequests.created_at.desc());
    
    // Apply filters if provided
    if (options.status) {
      query = query.where(eq(buybackRequests.status, options.status));
    }
    
    // Apply pagination
    if (options.limit) {
      const limit = parseInt(options.limit);
      const offset = options.page ? (parseInt(options.page) - 1) * limit : 0;
      query = query.limit(limit).offset(offset);
    }
    
    return await query;
    
  } catch (error) {
    console.error('Error fetching partner buyback requests:', error);
    throw error;
  }
}

module.exports = {
  getAllPartners,
  getPartnerById,
  getPartnerByEmail,
  getPartnerByTenantId,
  createPartner,
  updatePartner,
  disablePartner,
  assignBuybackToPartner,
  getPartnerBuybackRequests,
};