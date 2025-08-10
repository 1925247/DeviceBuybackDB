/**
 * Price calculation utilities for device buyback platform
 */

/**
 * Calculate base price for a device
 * @param {Object} device - Device information
 * @returns {number} Base price in INR
 */
export function calculateBasePrice(device) {
  try {
    const { deviceType, brand, originalPrice, purchaseDate, marketDemand = 'normal_demand' } = device;
    
    // Validate input
    if (!originalPrice || originalPrice <= 0) {
      throw new Error('Invalid original price');
    }
    
    let basePrice = parseFloat(originalPrice);
    
    // Age depreciation factor
    const ageFactor = calculateAgeFactor(purchaseDate);
    basePrice *= ageFactor;
    
    // Brand factor - premium brands retain more value
    const brandFactor = getBrandFactor(brand, deviceType);
    basePrice *= brandFactor;
    
    // Market demand adjustment
    const demandFactor = getMarketDemandFactor(marketDemand);
    basePrice *= demandFactor;
    
    // Device type specific adjustment
    const deviceTypeFactor = getDeviceTypeFactor(deviceType);
    basePrice *= deviceTypeFactor;
    
    // Buyback percentage (typically 40-70% of current market value)
    const buybackPercentage = getBuybackPercentage(deviceType, brand);
    basePrice *= buybackPercentage;
    
    return Math.round(basePrice);
    
  } catch (error) {
    console.error('Error calculating base price:', error);
    // Return minimum base price as fallback
    return 500;
  }
}

/**
 * Calculate final price after condition assessment
 * @param {number} basePrice - Base price
 * @param {Object} conditionAnswers - User's condition responses
 * @param {string} deviceType - Type of device
 * @returns {number} Final price in INR
 */
export function calculateFinalPrice(basePrice, conditionAnswers = {}, deviceType) {
  try {
    let finalPrice = basePrice;
    let totalImpact = 0;
    
    // Process each condition answer
    for (const [questionId, answer] of Object.entries(conditionAnswers)) {
      if (answer && answer.weightage !== undefined) {
        totalImpact += parseFloat(answer.weightage);
      }
    }
    
    // Apply condition impact
    const conditionMultiplier = 1 + (totalImpact / 100);
    finalPrice = finalPrice * conditionMultiplier;
    
    // Ensure minimum price
    const minimumPrice = getMinimumPrice(deviceType);
    finalPrice = Math.max(finalPrice, minimumPrice);
    
    return Math.round(finalPrice);
    
  } catch (error) {
    console.error('Error calculating final price:', error);
    return Math.round(basePrice * 0.7); // 70% fallback
  }
}

/**
 * Calculate detailed price breakdown
 * @param {Object} device - Device information
 * @param {Object} conditionAnswers - Condition responses
 * @returns {Object} Price breakdown details
 */
export function calculatePriceBreakdown(device, conditionAnswers = {}) {
  try {
    const breakdown = {
      originalPrice: device.originalPrice,
      depreciation: 0,
      brandAdjustment: 0,
      conditionAdjustments: [],
      totalDeductions: 0,
      finalPrice: 0
    };
    
    // Age depreciation
    const ageFactor = calculateAgeFactor(device.purchaseDate);
    breakdown.depreciation = Math.round(device.originalPrice * (1 - ageFactor));
    
    // Brand adjustment
    const brandFactor = getBrandFactor(device.brand, device.deviceType);
    breakdown.brandAdjustment = Math.round(device.originalPrice * (brandFactor - 1));
    
    // Condition adjustments
    let conditionTotal = 0;
    for (const [questionId, answer] of Object.entries(conditionAnswers)) {
      if (answer && answer.weightage !== undefined) {
        const impact = Math.round(device.originalPrice * (answer.weightage / 100));
        breakdown.conditionAdjustments.push({
          question: answer.question || `Question ${questionId}`,
          impact: impact,
          percentage: answer.weightage
        });
        conditionTotal += impact;
      }
    }
    
    breakdown.totalDeductions = breakdown.depreciation + Math.abs(conditionTotal);
    breakdown.finalPrice = Math.max(
      device.originalPrice - breakdown.totalDeductions + breakdown.brandAdjustment,
      getMinimumPrice(device.deviceType)
    );
    
    return breakdown;
    
  } catch (error) {
    console.error('Error calculating price breakdown:', error);
    return {
      originalPrice: device.originalPrice,
      depreciation: 0,
      brandAdjustment: 0,
      conditionAdjustments: [],
      totalDeductions: 0,
      finalPrice: Math.round(device.originalPrice * 0.5)
    };
  }
}

/**
 * Calculate age depreciation factor
 */
function calculateAgeFactor(purchaseDate) {
  if (!purchaseDate) return 0.7; // Default 70% if no date
  
  const now = new Date();
  const purchase = new Date(purchaseDate);
  const ageInMonths = (now - purchase) / (1000 * 60 * 60 * 24 * 30);
  
  // Depreciation curve - devices lose value faster in first year
  if (ageInMonths <= 6) return 0.85;      // 6 months: 85%
  if (ageInMonths <= 12) return 0.75;     // 1 year: 75%
  if (ageInMonths <= 24) return 0.60;     // 2 years: 60%
  if (ageInMonths <= 36) return 0.45;     // 3 years: 45%
  return 0.30; // 3+ years: 30%
}

/**
 * Get brand factor for price calculation
 */
function getBrandFactor(brand, deviceType) {
  const brandLower = brand?.toLowerCase() || '';
  
  if (deviceType === 'smartphones' || deviceType === 'smartphone') {
    switch (brandLower) {
      case 'apple': return 1.15;    // Premium: +15%
      case 'samsung': return 1.10;  // Premium: +10%
      case 'oneplus': return 1.05;  // Premium: +5%
      case 'google': return 1.05;   // Premium: +5%
      case 'xiaomi': return 1.0;    // Standard
      case 'realme': return 0.95;   // Budget: -5%
      case 'vivo': return 0.95;     // Budget: -5%
      case 'oppo': return 0.95;     // Budget: -5%
      default: return 0.90;         // Unknown: -10%
    }
  }
  
  if (deviceType === 'laptops' || deviceType === 'laptop') {
    switch (brandLower) {
      case 'apple': return 1.20;    // Premium: +20%
      case 'lenovo': return 1.10;   // Business: +10%
      case 'dell': return 1.10;     // Business: +10%
      case 'hp': return 1.05;       // Standard: +5%
      case 'asus': return 1.05;     // Gaming: +5%
      case 'acer': return 1.0;      // Standard
      default: return 0.95;         // Others: -5%
    }
  }
  
  return 1.0; // Default no adjustment
}

/**
 * Get market demand factor
 */
function getMarketDemandFactor(marketDemand) {
  switch (marketDemand) {
    case 'high_demand': return 1.10;     // +10%
    case 'normal_demand': return 1.0;    // No change
    case 'low_demand': return 0.90;      // -10%
    case 'festival_season': return 1.15; // +15%
    default: return 1.0;
  }
}

/**
 * Get device type factor
 */
function getDeviceTypeFactor(deviceType) {
  const typeLower = deviceType?.toLowerCase() || '';
  
  switch (typeLower) {
    case 'smartphone':
    case 'smartphones': return 1.0;      // Base
    case 'laptop':
    case 'laptops': return 1.05;         // +5%
    case 'tablet':
    case 'tablets': return 0.90;         // -10%
    case 'smartwatch':
    case 'smartwatches': return 0.85;    // -15%
    default: return 0.95;                // -5%
  }
}

/**
 * Get buyback percentage based on device type and brand
 */
function getBuybackPercentage(deviceType, brand) {
  const brandLower = brand?.toLowerCase() || '';
  const typeLower = deviceType?.toLowerCase() || '';
  
  // Premium brands and devices get higher buyback percentage
  if (brandLower === 'apple') {
    return typeLower.includes('laptop') ? 0.65 : 0.60; // 65% for MacBooks, 60% for iPhones
  }
  
  if (brandLower === 'samsung') {
    return 0.55; // 55% for Samsung devices
  }
  
  // Standard brands
  if (['oneplus', 'google', 'lenovo', 'dell'].includes(brandLower)) {
    return 0.50; // 50%
  }
  
  // Budget brands
  return 0.45; // 45%
}

/**
 * Get minimum price based on device type
 */
function getMinimumPrice(deviceType) {
  const typeLower = deviceType?.toLowerCase() || '';
  
  switch (typeLower) {
    case 'smartphone':
    case 'smartphones': return 500;      // ₹500 minimum
    case 'laptop':
    case 'laptops': return 2000;         // ₹2000 minimum
    case 'tablet':
    case 'tablets': return 800;          // ₹800 minimum
    case 'smartwatch':
    case 'smartwatches': return 300;     // ₹300 minimum
    default: return 200;                 // ₹200 minimum
  }
}