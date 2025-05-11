// Mock valuation data for UI development and testing
// These will be replaced with database data in production

// Base prices for device models with variants
export const variantModelPrices: Record<string, Record<string, number>> = {
  'iphone-14-pro': {
    '128GB': 700,
    '256GB': 800,
    '512GB': 950,
    '1TB': 1100
  },
  'iphone-13': {
    '128GB': 500,
    '256GB': 600,
    '512GB': 750
  },
  'galaxy-s23-ultra': {
    '256GB': 800,
    '512GB': 950,
    '1TB': 1100
  },
  'pixel-7-pro': {
    '128GB': 450,
    '256GB': 550,
    '512GB': 700
  },
  'ipad-pro-12-9': {
    '128GB': 750,
    '256GB': 850,
    '512GB': 1000,
    '1TB': 1200,
    '2TB': 1400
  },
  'macbook-pro-16': {
    '512GB': 1500,
    '1TB': 1700,
    '2TB': 2000,
    '4TB': 2400,
    '8TB': 3000
  }
};

// Condition multipliers (percentage of base price)
export const conditionMultipliers = {
  'excellent': 1.0,  // 100% of base price
  'good': 0.8,       // 80% of base price
  'fair': 0.6,       // 60% of base price
  'poor': 0.4        // 40% of base price
};

// Additional feature values (flat amount added to valuation)
export const additionalFeatureValues = {
  'AppleCare+': 50,
  'original-box': 20,
  'original-accessories': 30,
  'warranty-remaining': 40
};