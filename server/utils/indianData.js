/**
 * Indian market data utilities
 */

// City tier information for pricing adjustments
const CITY_TIERS = {
  tier1: {
    cities: ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune', 'gurgaon', 'noida'],
    adjustment: 1.10, // +10% for tier 1 cities
    pickupAvailable: true,
    estimatedDelivery: '1-2 days'
  },
  tier2: {
    cities: ['ahmedabad', 'surat', 'jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam', 'vadodara', 'firozabad', 'ludhiana', 'rajkot', 'agra'],
    adjustment: 1.05, // +5% for tier 2 cities
    pickupAvailable: true,
    estimatedDelivery: '2-3 days'
  },
  tier3: {
    cities: [], // All other cities
    adjustment: 1.0, // No adjustment for tier 3
    pickupAvailable: true,
    estimatedDelivery: '3-5 days'
  }
};

// PIN code to city mapping (sample data)
const PIN_CODE_DATA = {
  // Mumbai
  '400001': { name: 'Mumbai', state: 'Maharashtra', tier: 'tier1' },
  '400012': { name: 'Mumbai', state: 'Maharashtra', tier: 'tier1' },
  '400051': { name: 'Mumbai', state: 'Maharashtra', tier: 'tier1' },
  
  // Delhi
  '110001': { name: 'Delhi', state: 'Delhi', tier: 'tier1' },
  '110011': { name: 'Delhi', state: 'Delhi', tier: 'tier1' },
  '110021': { name: 'Delhi', state: 'Delhi', tier: 'tier1' },
  
  // Bangalore
  '560001': { name: 'Bangalore', state: 'Karnataka', tier: 'tier1' },
  '560012': { name: 'Bangalore', state: 'Karnataka', tier: 'tier1' },
  '560034': { name: 'Bangalore', state: 'Karnataka', tier: 'tier1' },
  
  // Chennai
  '600001': { name: 'Chennai', state: 'Tamil Nadu', tier: 'tier1' },
  '600014': { name: 'Chennai', state: 'Tamil Nadu', tier: 'tier1' },
  '600028': { name: 'Chennai', state: 'Tamil Nadu', tier: 'tier1' },
  
  // Hyderabad
  '500001': { name: 'Hyderabad', state: 'Telangana', tier: 'tier1' },
  '500016': { name: 'Hyderabad', state: 'Telangana', tier: 'tier1' },
  '500032': { name: 'Hyderabad', state: 'Telangana', tier: 'tier1' },
  
  // Pune
  '411001': { name: 'Pune', state: 'Maharashtra', tier: 'tier1' },
  '411014': { name: 'Pune', state: 'Maharashtra', tier: 'tier1' },
  '411028': { name: 'Pune', state: 'Maharashtra', tier: 'tier1' },
  
  // Tier 2 cities
  '380001': { name: 'Ahmedabad', state: 'Gujarat', tier: 'tier2' },
  '302001': { name: 'Jaipur', state: 'Rajasthan', tier: 'tier2' },
  '226001': { name: 'Lucknow', state: 'Uttar Pradesh', tier: 'tier2' },
  '440001': { name: 'Nagpur', state: 'Maharashtra', tier: 'tier2' },
  '452001': { name: 'Indore', state: 'Madhya Pradesh', tier: 'tier2' }
};

/**
 * Get regional price adjustment based on PIN code
 * @param {string} pinCode - PIN code
 * @param {string} brand - Device brand
 * @param {string} deviceType - Device type
 * @returns {number} Adjustment factor
 */
export function getRegionalPriceAdjustment(pinCode, brand, deviceType) {
  try {
    const cityInfo = getCityInfo(pinCode);
    
    if (!cityInfo) {
      return 1.0; // No adjustment for unknown PIN codes
    }
    
    const tierInfo = CITY_TIERS[cityInfo.tier];
    let adjustment = tierInfo.adjustment;
    
    // Brand-specific adjustments for metro cities
    if (cityInfo.tier === 'tier1') {
      const brandLower = brand?.toLowerCase() || '';
      
      // Premium brands get additional boost in metro cities
      if (['apple', 'samsung'].includes(brandLower)) {
        adjustment += 0.05; // Additional +5%
      }
    }
    
    return adjustment;
    
  } catch (error) {
    console.error('Error calculating regional adjustment:', error);
    return 1.0;
  }
}

/**
 * Get city information from PIN code
 * @param {string} pinCode - PIN code
 * @returns {Object|null} City information
 */
export function getCityInfo(pinCode) {
  try {
    const cleanedPinCode = pinCode?.toString().replace(/\D/g, '');
    
    if (!cleanedPinCode || cleanedPinCode.length !== 6) {
      return null;
    }
    
    // Direct lookup
    const cityData = PIN_CODE_DATA[cleanedPinCode];
    if (cityData) {
      const tierInfo = CITY_TIERS[cityData.tier];
      return {
        ...cityData,
        pickup_available: tierInfo.pickupAvailable,
        estimated_delivery: tierInfo.estimatedDelivery
      };
    }
    
    // Fallback for unknown PIN codes - determine tier by PIN range
    const pinNum = parseInt(cleanedPinCode);
    let tier = 'tier3';
    
    // Mumbai (400xxx)
    if (pinNum >= 400000 && pinNum < 401000) tier = 'tier1';
    // Delhi (110xxx)
    else if (pinNum >= 110000 && pinNum < 111000) tier = 'tier1';
    // Bangalore (560xxx)
    else if (pinNum >= 560000 && pinNum < 561000) tier = 'tier1';
    // Chennai (600xxx)
    else if (pinNum >= 600000 && pinNum < 601000) tier = 'tier1';
    // Hyderabad (500xxx)
    else if (pinNum >= 500000 && pinNum < 501000) tier = 'tier1';
    // Pune (411xxx)
    else if (pinNum >= 411000 && pinNum < 412000) tier = 'tier1';
    
    const tierInfo = CITY_TIERS[tier];
    return {
      name: 'Unknown City',
      state: 'Unknown State',
      tier: tier,
      pickup_available: tierInfo.pickupAvailable,
      estimated_delivery: tierInfo.estimatedDelivery
    };
    
  } catch (error) {
    console.error('Error getting city info:', error);
    return null;
  }
}

/**
 * Validate Indian PIN code format
 * @param {string} pinCode - PIN code to validate
 * @returns {boolean} Is valid PIN code
 */
export function validatePinCode(pinCode) {
  const cleaned = pinCode?.toString().replace(/\D/g, '');
  return cleaned && cleaned.length === 6 && /^[1-9][0-9]{5}$/.test(cleaned);
}

/**
 * Get state information from PIN code
 * @param {string} pinCode - PIN code
 * @returns {string|null} State name
 */
export function getStateFromPinCode(pinCode) {
  try {
    const cleanedPinCode = pinCode?.toString().replace(/\D/g, '');
    
    if (!cleanedPinCode || cleanedPinCode.length !== 6) {
      return null;
    }
    
    const firstDigit = parseInt(cleanedPinCode[0]);
    
    // PIN code state mapping (first digit)
    const stateMapping = {
      1: 'Delhi',
      2: 'Haryana',
      3: 'Punjab',
      4: 'Maharashtra',
      5: 'Andhra Pradesh/Telangana',
      6: 'Tamil Nadu',
      7: 'West Bengal',
      8: 'Bihar/Jharkhand',
      9: 'Uttar Pradesh'
    };
    
    return stateMapping[firstDigit] || 'Unknown State';
    
  } catch (error) {
    console.error('Error getting state from PIN code:', error);
    return null;
  }
}

/**
 * Calculate GST based on state
 * @param {number} amount - Amount to calculate GST on
 * @param {string} pinCode - Customer PIN code
 * @returns {Object} GST breakdown
 */
export function calculateGST(amount, pinCode) {
  try {
    const state = getStateFromPinCode(pinCode);
    const gstRate = 18; // Standard GST rate for electronics
    
    // For interstate transactions, IGST applies
    // For intrastate, CGST + SGST applies
    const gstAmount = Math.round((amount * gstRate) / 100);
    
    return {
      rate: gstRate,
      amount: gstAmount,
      cgst: Math.round(gstAmount / 2), // 9%
      sgst: Math.round(gstAmount / 2), // 9%
      igst: gstAmount, // 18% (for interstate)
      total: amount + gstAmount,
      state: state
    };
    
  } catch (error) {
    console.error('Error calculating GST:', error);
    return {
      rate: 18,
      amount: Math.round((amount * 18) / 100),
      cgst: 0,
      sgst: 0,
      igst: Math.round((amount * 18) / 100),
      total: amount + Math.round((amount * 18) / 100),
      state: 'Unknown'
    };
  }
}