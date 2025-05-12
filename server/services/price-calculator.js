const { db } = require('../db');
const { eq, and } = require('drizzle-orm');
const { 
  valuations, 
  deviceModels, 
  conditionQuestions, 
  conditionAnswers 
} = require('../../shared/schema');

/**
 * Calculates the buyback price for a device based on model, condition, and questionnaire answers
 * @param {object} params - Price calculation parameters
 * @param {number} params.deviceModelId - ID of the device model
 * @param {string} params.condition - Overall condition (excellent, good, fair, poor)
 * @param {string} params.variant - Device variant (e.g., storage size)
 * @param {object} params.answers - Object with question IDs as keys and answer IDs as values
 * @returns {Promise<object>} - Calculated price with breakdown of deductions
 */
async function calculateBuybackPrice({ deviceModelId, condition, variant, answers = {} }) {
  try {
    // Get the base valuation for this device model
    const [valuation] = await db
      .select()
      .from(valuations)
      .where(eq(valuations.device_model_id, deviceModelId));
    
    if (!valuation) {
      throw new Error(`No valuation found for device model ID: ${deviceModelId}`);
    }
    
    // Get the device model to access brand info
    const [deviceModel] = await db
      .select()
      .from(deviceModels)
      .where(eq(deviceModels.id, deviceModelId));
    
    if (!deviceModel) {
      throw new Error(`Device model with ID ${deviceModelId} not found`);
    }
    
    // Start with the base price
    let basePrice = Number(valuation.base_price);
    
    // Apply condition multiplier
    let conditionMultiplier;
    switch (condition) {
      case 'excellent':
        conditionMultiplier = Number(valuation.condition_excellent);
        break;
      case 'good':
        conditionMultiplier = Number(valuation.condition_good);
        break;
      case 'fair':
        conditionMultiplier = Number(valuation.condition_fair);
        break;
      case 'poor':
        conditionMultiplier = Number(valuation.condition_poor);
        break;
      default:
        conditionMultiplier = 1.0;
    }
    
    let adjustedPrice = basePrice * conditionMultiplier;
    
    // Apply variant multiplier if applicable
    if (variant && valuation.variant_multipliers) {
      const variantMultiplier = valuation.variant_multipliers[variant] || 1.0;
      adjustedPrice *= variantMultiplier;
    }
    
    // Process questionnaire answers and apply deductions
    const deductions = [];
    let totalDeductionAmount = 0;
    
    if (answers && Object.keys(answers).length > 0) {
      // Get all the selected answers
      const answerIds = Object.values(answers);
      if (answerIds.length > 0) {
        const selectedAnswers = await db
          .select()
          .from(conditionAnswers)
          .where(inArray(conditionAnswers.id, answerIds));
        
        // Apply impact/deduction for each answer
        for (const answer of selectedAnswers) {
          // Impact is stored as a decimal (e.g., 0.10 for 10% reduction)
          const deductionPercent = Number(answer.impact);
          const deductionAmount = adjustedPrice * deductionPercent;
          
          // Get the question for this answer for better record-keeping
          const [question] = await db
            .select()
            .from(conditionQuestions)
            .where(eq(conditionQuestions.id, answer.question_id));
          
          deductions.push({
            question: question ? question.question : `Question ID: ${answer.question_id}`,
            answer: answer.answer,
            impact: deductionPercent,
            amount: deductionAmount
          });
          
          totalDeductionAmount += deductionAmount;
        }
      }
    }
    
    // Calculate final price
    const finalPrice = Math.max(0, adjustedPrice - totalDeductionAmount);
    
    // Apply brand-specific fixed deductions if needed
    let brandDeductions = [];
    if (deviceModel.brand_id) {
      // Get brand-specific deductions (like fixed amounts for common issues)
      brandDeductions = await getBrandSpecificDeductions(
        deviceModel.brand_id, 
        condition, 
        answers
      );
      
      // Apply brand deductions
      let brandDeductionTotal = 0;
      for (const deduction of brandDeductions) {
        brandDeductionTotal += deduction.amount;
      }
      
      finalPrice -= brandDeductionTotal;
    }
    
    // Round to 2 decimal places and ensure not negative
    const roundedFinalPrice = Math.max(0, Math.round(finalPrice * 100) / 100);
    
    return {
      deviceModelId,
      condition,
      variant,
      basePrice,
      conditionMultiplier,
      adjustedPrice,
      deductions: [...deductions, ...brandDeductions],
      finalPrice: roundedFinalPrice
    };
    
  } catch (error) {
    console.error('Error calculating buyback price:', error);
    throw error;
  }
}

/**
 * Gets brand-specific deductions for common issues
 * @param {number} brandId - ID of the device brand
 * @param {string} condition - Overall condition
 * @param {object} answers - Questionnaire answers
 * @returns {Promise<array>} - Array of brand-specific deductions
 */
async function getBrandSpecificDeductions(brandId, condition, answers) {
  // In a real implementation, this would be fetched from a database table
  // For now, we'll use a hardcoded set of deductions for common brands
  
  // Example for iPhone screen deduction
  if (brandId === 1) { // Assuming 1 is Apple
    const deductions = [];
    
    // Check if there's a screen damage answer
    const hasScreenDamage = Object.values(answers).some(answerId => {
      // This would check if any of the selected answers relate to screen damage
      // For now, we'll just assume some logic here
      return true; // This should be replaced with actual logic
    });
    
    if (hasScreenDamage) {
      deductions.push({
        type: 'fixed',
        description: 'iPhone screen replacement cost',
        amount: 500 // ₹500 deduction for cracked iPhone screen
      });
    }
    
    return deductions;
  }
  
  // Example for Samsung deductions
  if (brandId === 2) { // Assuming 2 is Samsung
    const deductions = [];
    
    // Process Samsung-specific deductions based on answers
    // This would be expanded with real logic based on your requirements
    
    return deductions;
  }
  
  // Default: no brand-specific deductions
  return [];
}

module.exports = {
  calculateBuybackPrice,
  getBrandSpecificDeductions
};