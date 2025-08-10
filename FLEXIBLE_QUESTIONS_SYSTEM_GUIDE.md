# Flexible Group Questions System - Complete Implementation Guide

## Overview

The Device Buyback Platform now features a highly flexible Group Questions system that provides maximum reusability and administrator control. This system enables admins to create reusable question groups, questions, and answers that can be mapped to multiple device models with model-specific deduction rates.

## System Architecture

### Core Features
- **Reusable Question Groups**: Groups can be applied to multiple device types and models
- **Flexible Question Mapping**: Individual questions can be mapped to specific models independently
- **Model-Specific Deduction Rates**: Each answer can have different impact percentages per model
- **Dynamic Pricing Calculations**: Real-time price adjustments based on selected answers
- **Complete Admin Control**: Full CRUD operations for groups, questions, and model mappings

### Database Schema Enhancement

The system uses these key mapping tables:
- `group_model_mappings`: Maps question groups to device models
- `question_model_mappings`: Maps individual questions to models  
- `answer_model_mappings`: Stores model-specific deduction rates for answers

## Sample Data Implementation

### Question Groups Created
1. **Body & Physical Condition** (Body category)
   - Color: Red (#EF4444)
   - Applicable to: Smartphones, Tablets, Laptops

2. **Screen & Display Assessment** (Screen category)
   - Color: Blue (#3B82F6)
   - Applicable to: Smartphones, Tablets, Laptops

3. **Functional Issues Check** (Functional category)
   - Color: Purple (#8B5CF6)
   - Applicable to: Smartphones, Tablets, Smartwatches

4. **One Month Warranty Coverage** (Warranty category)
   - Color: Green (#10B981)
   - Applicable to: Smartphones, Laptops, Tablets

5. **Accessories & Box Contents** (Accessories category)
   - Color: Orange (#F59E0B)
   - Applicable to: Smartphones, Laptops, Smartwatches

### Sample Questions and Answers

#### Physical Damage Question (Group: Body & Physical Condition)
- **Question**: "Is there any physical damage to the device body?"
- **Answers**:
  - No damage (0% deduction)
  - Minor scratches (-5% deduction)
  - Visible scratches/dents (-15% deduction)
  - Major damage/cracks (-30% deduction)

#### Screen Condition Question (Group: Screen & Display Assessment)
- **Question**: "How is the screen condition?"
- **Answers**:
  - Perfect condition (0% deduction)
  - Minor scratches (-8% deduction)
  - Visible scratches (-18% deduction)
  - Cracked/damaged (-40% deduction)

## API Endpoints

### Question Groups Management
- `GET /api/flexible-question-groups/stats` - Get groups with statistics
- `POST /api/flexible-question-groups` - Create new question group
- `POST /api/flexible-question-groups/:groupId/map-models` - Map group to models

### Question & Answer Management
- `POST /api/flexible-question-groups/questions/:questionId/map-models` - Map question to models
- `POST /api/flexible-question-groups/answers/:answerId/model-rates` - Set model-specific rates
- `GET /api/flexible-question-groups/models/:modelId/questions` - Get questions for model

### Pricing Calculations
- `POST /api/flexible-question-groups/models/:modelId/calculate-price` - Calculate model price

## Admin Interface

### Advanced Question Group Manager
**Route**: `/admin/advanced-question-groups`

**Features**:
- View all question groups with statistics
- Create and edit reusable question groups
- Map groups to specific device models
- Set model-specific deduction rates
- Visual group identification with color coding
- Real-time pricing preview

**Key Components**:
- Question group listing with device type filters
- Model mapping interface with checkboxes
- Rate adjustment controls for fine-tuned pricing
- Preview panels showing calculated impacts

## Implementation Benefits

### Maximum Flexibility
- **Reusable Components**: Groups, questions, and answers can be used across multiple models
- **Granular Control**: Admins can map at group or individual question level
- **Custom Rates**: Different deduction percentages per model for same answer

### Efficient Management
- **No Duplication**: Single question/answer serves multiple models
- **Bulk Operations**: Map entire groups to multiple models at once
- **Centralized Control**: All mappings managed from single interface

### Accurate Pricing
- **Model-Specific Logic**: Each model can have unique pricing rules
- **Dynamic Calculations**: Real-time price updates as mappings change
- **Comprehensive Coverage**: All question categories properly weighted

## Usage Examples

### Scenario 1: iPhone vs Android Pricing
- Same question: "Is there any physical damage?"
- iPhone models: Minor scratches = -5% deduction
- Android models: Minor scratches = -3% deduction
- System handles different rates automatically

### Scenario 2: Device Type Variations
- Laptop screen damage: Higher repair costs, bigger deductions
- Smartphone screen damage: Standard deduction rates
- Tablet screen damage: Medium deduction rates

### Scenario 3: Brand-Specific Considerations
- Premium brand devices: Lower deductions for minor issues
- Budget brand devices: Higher deductions for same issues
- Luxury devices: Minimal impact for acceptable wear

## Technical Implementation

### Flexible Mapping System
```javascript
// Group to Model Mapping
const mapGroupToModels = async (groupId, modelIds, deductionRates) => {
  // Creates entries in group_model_mappings table
  // Enables bulk application of question groups
};

// Model-Specific Rate Setting
const setAnswerModelRates = async (answerId, modelRates) => {
  // Updates answer_model_mappings table
  // Allows custom deduction percentages per model
};
```

### Real-Time Price Calculation
```javascript
const calculateModelSpecificPrice = async (modelId, answers) => {
  // 1. Fetch all mapped questions for model
  // 2. Apply model-specific deduction rates
  // 3. Calculate final adjusted price
  // 4. Return comprehensive pricing breakdown
};
```

## Future Enhancements

### Planned Features
- **Question Dependencies**: Conditional questions based on previous answers
- **Bulk Import/Export**: CSV-based question and mapping management
- **Analytics Dashboard**: Performance metrics for question groups
- **A/B Testing**: Compare different pricing strategies

### Scalability Considerations
- **Performance Optimization**: Indexed queries for fast lookups
- **Caching Strategy**: Redis caching for frequently accessed mappings
- **API Rate Limiting**: Protection against excessive requests
- **Database Optimization**: Query optimization for complex joins

## Conclusion

The Flexible Group Questions system provides the Device Buyback Platform with unprecedented control over device assessment and pricing. Administrators can now:

1. Create reusable question components
2. Apply them flexibly across device models
3. Set model-specific pricing rules
4. Calculate accurate valuations in real-time
5. Manage the entire system from a unified interface

This implementation ensures maximum flexibility while maintaining data integrity and providing accurate, fair pricing for all device types and conditions.

---

**Last Updated**: August 10, 2025
**System Status**: Fully Implemented and Operational
**Admin Access**: Available at `/admin/advanced-question-groups`