/**
 * Advanced price calculation API for Indian device buyback platform
 */

import { calculateBasePrice, calculateFinalPrice, calculatePriceBreakdown } from '../utils/priceCalculation.js';
import { getRegionalPriceAdjustment, getCityInfo } from '../utils/indianData.js';

export async function calculateDevicePrice(req, res) {
  try {
    const {
      deviceType,
      brand,
      model,
      originalPrice,
      storage,
      purchaseDate,
      conditionAnswers = {},
      pinCode,
      marketDemand = 'normal_demand'
    } = req.body;

    // Validate required fields
    if (!deviceType || !brand || !model || !originalPrice) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['deviceType', 'brand', 'model', 'originalPrice']
      });
    }

    // Build device object
    const device = {
      deviceType: deviceType.toLowerCase(),
      brand: brand.toLowerCase(),
      model,
      originalPrice: parseFloat(originalPrice),
      storage,
      purchaseDate,
      marketDemand
    };

    // Calculate regional adjustment if PIN code provided
    let regionalAdjustment = 1.0;
    let cityInfo = null;
    
    if (pinCode) {
      regionalAdjustment = getRegionalPriceAdjustment(pinCode, brand, deviceType);
      cityInfo = getCityInfo(pinCode);
    }

    // Calculate base price
    const basePrice = calculateBasePrice(device);
    
    // Apply regional adjustment
    const adjustedBasePrice = Math.round(basePrice * regionalAdjustment);
    
    // Calculate final price with condition assessment
    const finalPrice = calculateFinalPrice(adjustedBasePrice, conditionAnswers, deviceType);
    
    // Get detailed breakdown
    const breakdown = calculatePriceBreakdown({
      ...device,
      originalPrice: adjustedBasePrice
    }, conditionAnswers);

    // Calculate GST (if applicable for business transactions)
    const gstRate = 18; // 18% GST for electronics
    const gstAmount = Math.round((finalPrice * gstRate) / 100);

    const response = {
      success: true,
      data: {
        deviceInfo: {
          type: deviceType,
          brand,
          model,
          storage
        },
        pricing: {
          originalPrice: device.originalPrice,
          basePrice,
          regionalAdjustment,
          adjustedBasePrice,
          finalPrice,
          gstAmount,
          totalWithGst: finalPrice + gstAmount
        },
        breakdown,
        location: cityInfo ? {
          city: cityInfo.name,
          tier: cityInfo.tier,
          estimatedPickup: cityInfo.estimated_delivery,
          pickupAvailable: cityInfo.pickup_available
        } : null,
        metadata: {
          calculatedAt: new Date().toISOString(),
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          marketDemand,
          currency: 'INR'
        }
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error calculating device price:', error);
    res.status(500).json({
      error: 'Price calculation failed',
      message: error.message
    });
  }
}

export async function getMarketTrends(req, res) {
  try {
    const { deviceType, brand, model, region } = req.query;

    // Mock market trends data - replace with real market analysis
    const trends = {
      deviceType: deviceType || 'smartphones',
      marketDemand: 'normal_demand',
      priceDirection: 'stable',
      demandFactors: [
        'Festival season approaching',
        'New model launch affecting older models',
        'Supply chain improvements'
      ],
      competitorPricing: {
        average: 25000,
        range: { min: 20000, max: 30000 },
        confidence: 85
      },
      seasonalFactors: {
        currentSeason: 'pre_festival',
        impact: '+5%',
        nextTrend: 'High demand expected in next 30 days'
      },
      regionalData: region ? {
        region,
        localDemand: 'high',
        avgResaleValue: 45
      } : null
    };

    res.json({
      success: true,
      data: trends,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching market trends:', error);
    res.status(500).json({
      error: 'Failed to fetch market trends',
      message: error.message
    });
  }
}

export async function validateDeviceDetails(req, res) {
  try {
    const { imei, serialNumber, deviceType, brand, model } = req.body;

    const validation = {
      isValid: true,
      checks: {},
      warnings: [],
      deviceInfo: null
    };

    // IMEI validation for smartphones
    if (deviceType === 'smartphones' && imei) {
      const imeiValidation = validateIMEI(imei);
      validation.checks.imei = imeiValidation;
      
      if (imeiValidation.isValid) {
        // Mock device info from IMEI - replace with real IMEI lookup service
        validation.deviceInfo = {
          brand: brand || 'Unknown',
          model: model || 'Unknown',
          manufacturer: 'Verified',
          warranty: 'Check required'
        };
      }
    }

    // Serial number validation
    if (serialNumber) {
      const serialValidation = validateSerialNumber(serialNumber, deviceType);
      validation.checks.serialNumber = serialValidation;
    }

    // Check if device is stolen (mock implementation)
    validation.checks.stolenCheck = {
      isValid: true,
      status: 'clear',
      message: 'Device not reported as stolen'
    };

    // Add warnings for common issues
    if (validation.deviceInfo?.warranty === 'expired') {
      validation.warnings.push('Device warranty has expired');
    }

    res.json({
      success: true,
      data: validation
    });

  } catch (error) {
    console.error('Error validating device details:', error);
    res.status(500).json({
      error: 'Device validation failed',
      message: error.message
    });
  }
}

// Helper function for IMEI validation
function validateIMEI(imei) {
  const cleaned = imei.replace(/\D/g, '');
  
  if (cleaned.length !== 15) {
    return { isValid: false, message: 'IMEI must be 15 digits' };
  }
  
  // Luhn algorithm validation
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(cleaned[i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit = Math.floor(digit / 10) + (digit % 10);
    }
    sum += digit;
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  const isValid = checkDigit === parseInt(cleaned[14]);
  
  return {
    isValid,
    message: isValid ? 'Valid IMEI' : 'Invalid IMEI checksum',
    formatted: cleaned
  };
}

// Helper function for serial number validation
function validateSerialNumber(serialNumber, deviceType) {
  if (!serialNumber || serialNumber.trim().length < 5) {
    return {
      isValid: false,
      message: 'Serial number too short'
    };
  }
  
  // Basic pattern validation
  const isValid = /^[A-Z0-9]{5,20}$/i.test(serialNumber);
  
  return {
    isValid,
    message: isValid ? 'Valid serial number format' : 'Invalid serial number format'
  };
}