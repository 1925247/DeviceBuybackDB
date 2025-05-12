const { db } = require('../db');
const { sql, eq, and, inArray } = require('drizzle-orm');
const { partners, buybackRequests, users } = require('../../shared/schema');

/**
 * Assigns a buyback request to a partner based on PIN code and device expertise
 * @param {number} buybackRequestId - ID of the buyback request to assign
 * @returns {Promise<object>} - Assignment result with partner info
 */
async function assignBuybackRequestToPartner(buybackRequestId) {
  try {
    // Get the buyback request details
    const [buybackRequest] = await db
      .select()
      .from(buybackRequests)
      .where(eq(buybackRequests.id, buybackRequestId));
    
    if (!buybackRequest) {
      throw new Error(`Buyback request with ID ${buybackRequestId} not found`);
    }
    
    // If already assigned to a partner, return that information
    if (buybackRequest.partner_id) {
      const [assignedPartner] = await db
        .select()
        .from(partners)
        .where(eq(partners.id, buybackRequest.partner_id));
      
      return {
        assigned: true,
        message: 'Buyback request already assigned to a partner',
        partner: assignedPartner,
        buybackRequest
      };
    }
    
    // Extract PIN code from pickup address if available
    let pinCode = buybackRequest.pin_code;
    
    if (!pinCode && buybackRequest.pickup_address) {
      // Simple regex to find PIN code format (e.g., 6-digit number in Indian addresses)
      const pinMatch = buybackRequest.pickup_address.match(/\b\d{6}\b/);
      if (pinMatch) {
        pinCode = pinMatch[0];
      }
    }
    
    // Find eligible partners based on criteria
    const eligiblePartners = await findEligiblePartners({
      pinCode,
      deviceTypeId: buybackRequest.device_type_id,
      specialization: buybackRequest.device_type // Use device type as specialization
    });
    
    if (eligiblePartners.length === 0) {
      return {
        assigned: false,
        message: 'No eligible partners found for this request',
        buybackRequest
      };
    }
    
    // Select the best partner (for now, just take the first eligible one)
    // In a production system, this could include partner capacity, ratings, etc.
    const selectedPartner = eligiblePartners[0];
    
    // Assign the request to the selected partner
    await db
      .update(buybackRequests)
      .set({
        partner_id: selectedPartner.id,
        updated_at: new Date()
      })
      .where(eq(buybackRequests.id, buybackRequestId));
    
    // Get the updated buyback request
    const [updatedRequest] = await db
      .select()
      .from(buybackRequests)
      .where(eq(buybackRequests.id, buybackRequestId));
    
    return {
      assigned: true,
      message: 'Buyback request successfully assigned to partner',
      partner: selectedPartner,
      buybackRequest: updatedRequest
    };
    
  } catch (error) {
    console.error('Error assigning buyback request to partner:', error);
    throw error;
  }
}

/**
 * Finds eligible partners based on PIN code and device expertise
 * @param {object} criteria - Criteria for partner selection
 * @returns {Promise<array>} - Array of eligible partners
 */
async function findEligiblePartners({ pinCode, deviceTypeId, specialization }) {
  try {
    // Base query for active partners
    let query = db
      .select()
      .from(partners)
      .where(eq(partners.status, 'active'));
    
    // Prioritize partners who specialize in the given device type
    if (deviceTypeId) {
      // This complex query checks if the device_types array contains the specified deviceTypeId
      query = query.orderBy(sql`CASE WHEN ${partners.device_types} @> ARRAY[${deviceTypeId}]::int[] THEN 0 ELSE 1 END`);
    }
    
    // Prioritize Windows phone specialists if applicable
    if (specialization && specialization.toLowerCase().includes('windows')) {
      query = query.orderBy(sql`CASE WHEN ${partners.specialization} ILIKE '%windows%' THEN 0 ELSE 1 END`);
    }
    
    // Get all potential partners
    const potentialPartners = await query;
    
    // Filter partners by PIN code if available
    if (pinCode) {
      return potentialPartners.filter(partner => {
        // Check if the partner handles this PIN code
        if (!partner.pin_codes || partner.pin_codes.length === 0) {
          return true; // Partner accepts all PIN codes
        }
        
        // Check if PIN code matches or starts with any of the partner's PIN codes
        return partner.pin_codes.some(partnerPin => {
          if (partnerPin.endsWith('*')) {
            // Prefix matching (e.g., "22*" matches "221234")
            const prefix = partnerPin.replace('*', '');
            return pinCode.startsWith(prefix);
          }
          return pinCode === partnerPin;
        });
      });
    }
    
    return potentialPartners;
    
  } catch (error) {
    console.error('Error finding eligible partners:', error);
    throw error;
  }
}

/**
 * Assigns a staff member to a buyback request
 * @param {number} buybackRequestId - ID of the buyback request
 * @param {number} staffId - ID of the staff member
 * @returns {Promise<object>} - Assignment result
 */
async function assignStaffToBuybackRequest(buybackRequestId, staffId) {
  try {
    // Verify the staff exists
    const [staff] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.id, staffId),
        eq(users.role, 'staff')
      ));
    
    if (!staff) {
      throw new Error(`Staff member with ID ${staffId} not found`);
    }
    
    // Update the buyback request
    await db
      .update(buybackRequests)
      .set({
        staff_id: staffId,
        status: 'assigned',
        updated_at: new Date()
      })
      .where(eq(buybackRequests.id, buybackRequestId));
    
    // Get the updated buyback request
    const [updatedRequest] = await db
      .select()
      .from(buybackRequests)
      .where(eq(buybackRequests.id, buybackRequestId));
    
    return {
      assigned: true,
      message: 'Staff member successfully assigned to buyback request',
      staff,
      buybackRequest: updatedRequest
    };
    
  } catch (error) {
    console.error('Error assigning staff to buyback request:', error);
    throw error;
  }
}

module.exports = {
  assignBuybackRequestToPartner,
  findEligiblePartners,
  assignStaffToBuybackRequest
};