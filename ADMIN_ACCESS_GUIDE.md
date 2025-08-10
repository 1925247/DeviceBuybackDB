# Admin Panel Access Guide - Cash Old Device

## 🚀 Direct Admin Access URLs

### **Main Admin Portal:**
**URL:** http://localhost:5000/admin/login

**Login Credentials:**
- Username: `admin`
- Password: `admin`

### **Professional Admin Sidebar Navigation:**
The admin panel now features a **professional sidebar** with organized sections:

**📊 Dashboard** - Overview and analytics
**📱 Device Management** - Complete model and variant control
**❓ Question & Assessment** - Question groups and mapping
**🛒 Business Operations** - Orders and customer management  
**📈 Analytics & Reports** - Performance and insights
**⚙️ System Settings** - Configuration and settings

### **Key Admin Features:**

#### 1. **Advanced Question Group Manager**
**URL:** http://localhost:5000/admin/advanced-question-groups
- Manage all question groups for device assessment
- Map questions to specific device models
- Control which questions appear to customers
- Set deduction rates for each answer choice

#### 2. **NEW: Integrated Model Manager** ⭐
**URL:** http://localhost:5000/admin/integrated-models
- **Complete workflow:** Model → Variants → Question Mapping → Pricing
- Add models with inline variant management
- Map question groups directly to specific variants
- Real-time variant pricing and mapping status
- Single-page workflow for efficient model setup

#### 3. **PREMIUM: Advanced Model Integration** 🚀
**URL:** http://localhost:5000/admin/advanced-integration
- **Unified Device Management:** One-page advanced workflow
- **Mandatory Image Upload:** Required before model creation
- **Inline Variant Creation:** Add multiple variants immediately
- **Real-time Integration:** Model → Variants → Pricing → Questions
- **Simplified Workflow:** No switching between sections
- **Professional Interface:** Tabs-based organized layout

#### 2. **Model Management**
**URL:** http://localhost:5000/admin/models-advanced
- Manage device models and variants
- Set base prices for Cashify-style calculations
- Configure model-specific settings

#### 3. **Dashboard Overview**
**URL:** http://localhost:5000/admin
- Real-time analytics and system status
- Quick access to all management tools

## 📊 Current System Status

### **iPhone 13 Configuration:**
- **Base Price:** ₹45,000
- **Question Groups:** 5 mapped groups
  1. Body & Physical Condition (Standard)
  2. Screen & Display Assessment (Standard)  
  3. Advanced Functional Testing (Advanced)
  4. One Month Warranty Coverage (Advanced)
  5. Accessories & Original Box (Advanced)

### **Cashify-Style Calculation:**
- Formula: `Final Price = Base Price - Sum(Group Deductions)`
- Real-time calculation as customer answers questions
- Only admin-mapped questions appear to customers

## 🛠 Admin Management Tasks

### **Question Management:**
1. **Create Groups:** Define condition categories (Body, Screen, etc.)
2. **Add Questions:** Create assessment questions within groups
3. **Set Answer Choices:** Define options with deduction rates
4. **Model Mapping:** Assign groups to specific device models

### **Pricing Control:**
1. **Base Prices:** Set starting price for each model
2. **Deduction Rates:** Configure percentage impacts per answer
3. **Advanced vs Standard:** Control question complexity levels

### **Model Configuration:**
1. **Device Models:** Add new smartphones, laptops, tablets
2. **Variant Support:** Handle storage, color, condition variants
3. **Brand Management:** Organize models by manufacturer

## 🔧 API Endpoints for Management

### **Question Group APIs:**
- `GET /api/flexible-question-groups/stats` - Group statistics
- `POST /api/flexible-question-groups` - Create new group
- `PUT /api/flexible-question-groups/:id` - Update group
- `DELETE /api/flexible-question-groups/:id` - Delete group

### **Model Mapping APIs:**
- `POST /api/flexible-question-groups/:groupId/map-models` - Map to models
- `GET /api/v2/model/:modelId/assessment-flow` - View model questions

### **Calculation APIs:**
- `POST /api/v2/calculate-valuation` - Test calculations
- `GET /api/v2/model/:modelId/price-breakdown` - Price analysis

## 📱 Testing the System

### **iPhone 13 Assessment Test:**
1. Navigate to: http://localhost:5000/assessment/smartphone/apple/iphone-13
2. Answer all 5 question groups
3. See real-time price calculation
4. Final price = ₹45,000 - deductions

### **Admin Panel Test:**
1. Login at: http://localhost:5000/admin/login
2. Go to Advanced Question Groups
3. View iPhone 13 mappings
4. Test creating new groups or questions

## 🎯 System Benefits

1. **Complete Admin Control:** Manage all pricing logic through web interface
2. **Cashify Accuracy:** Exact group-based deduction calculations
3. **Model Flexibility:** Easy addition of new devices and questions
4. **Real-time Updates:** Changes reflect immediately on frontend
5. **Scalable Design:** Ready for laptops, tablets, other categories

## 🔑 Admin Credentials Summary

- **Username:** admin
- **Password:** admin
- **Email:** admin@casholddevice.com
- **Role:** Super Admin
- **Permissions:** Full system access

The admin panel is now fully functional with complete question and pricing management capabilities.