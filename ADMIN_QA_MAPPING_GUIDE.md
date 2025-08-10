# Admin Q&A Mapping Functions Guide

## Hindi: Admin mein Q&A Mapping ke liye Functions

### 1. Advanced Question Group Manager
**Route**: `/admin/advanced-question-groups`

**Main Functions:**
- **Question Groups बनाना**: नए question groups create करना
- **Model Mapping**: Groups को specific device models के साथ map करना  
- **Deduction Rates**: हर model के लिए अलग deduction percentages set करना
- **Question Management**: Individual questions को models के साथ map करना

### 2. Device Model Questions
**Route**: `/admin/device-model-questions`

**Main Functions:**
- **Question Assignment**: Specific questions को specific models assign करना
- **Bulk Mapping**: Multiple models को एक साथ questions assign करना
- **Question Validation**: Questions का testing और validation

### 3. Question Groups Manager
**Route**: `/admin/question-groups`

**Main Functions:**
- **Group Creation**: Basic question groups बनाना
- **Group Organization**: Questions को categories में organize करना
- **Device Type Assignment**: Groups को device types assign करना

## English: Key Admin Functions for Q&A Mapping

### Primary Mapping Functions:

#### 1. Group-to-Model Mapping
```
Function: mapGroupToModels()
Location: /api/flexible-question-groups/:groupId/map-models
Purpose: Maps entire question groups to device models
```

#### 2. Question-to-Model Mapping  
```
Function: mapQuestionToModels()
Location: /api/flexible-question-groups/questions/:questionId/map-models
Purpose: Maps individual questions to specific models
```

#### 3. Answer Rate Setting
```
Function: setAnswerModelRates()
Location: /api/flexible-question-groups/answers/:answerId/model-rates
Purpose: Sets model-specific deduction rates for answers
```

## Current Implementation Status

### ✅ Working Features:
- Group creation and management
- Group-to-model mappings (working for iPhone 13)
- Sample questions with answers
- Model-specific question fetching

### 🔧 Active Fixes:
- Individual question mapping table structure
- Answer deduction rate customization
- Bulk mapping operations

## How to Use (Step by Step):

### Step 1: Create Question Groups
1. Go to `/admin/advanced-question-groups`
2. Click "Create New Group"
3. Fill group details (name, category, device types)

### Step 2: Map Groups to Models
1. Select a question group
2. Choose target device models
3. Set deduction rates per model
4. Save mappings

### Step 3: Test Frontend
1. Go to device assessment flow
2. Select mapped device model
3. Only mapped questions will appear

## Database Tables:

- **question_groups**: Main groups table
- **group_model_mappings**: Group to model relationships
- **question_model_mappings**: Individual question to model relationships  
- **answer_model_mappings**: Answer-specific rates per model

## API Endpoints for Mapping:

```
GET /api/flexible-question-groups/stats
POST /api/flexible-question-groups
POST /api/flexible-question-groups/:groupId/map-models
POST /api/flexible-question-groups/questions/:questionId/map-models
POST /api/flexible-question-groups/answers/:answerId/model-rates
GET /api/flexible-question-groups/models/:modelId/questions
```

The system ensures that only admin-mapped questions appear to customers during device assessment.