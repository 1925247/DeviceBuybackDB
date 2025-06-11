# Device Buyback & Refurbished Electronics Marketplace

A comprehensive Indian localized device buyback platform with advanced question-based assessment system, real-time pricing calculations, and device-specific targeting capabilities.

## 🚀 Features

### Core Platform
- **Indian Market Localization**: INR pricing, PIN code validation, state/city auto-fill
- **Device Assessment System**: Question-based evaluation with condition-specific pricing
- **Multi-Device Support**: Smartphones, laptops, tablets, smartwatches, headphones
- **Real-time Pricing**: Dynamic price calculation based on device condition
- **Partner Network**: Multi-partner staff management and buyback routing

### Advanced Question Management
- **Question Groups**: Categorized assessment (screen, battery, physical, functional)
- **Device Targeting**: Model-specific and brand-specific question assignment
- **Severity Levels**: Answer choices with impact percentages (none, minor, major, critical)
- **Assessment Demo**: Live testing interface for question validation
- **Admin Dashboard**: Comprehensive management interface

### Technical Stack
- **Frontend**: React.js with TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Node.js with Express, Drizzle ORM
- **Database**: PostgreSQL with real-time synchronization
- **Deployment**: Docker-ready with health checks

## 📋 Prerequisites

- Node.js 20+ 
- PostgreSQL 14+
- npm or yarn package manager

## 🛠️ Installation & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd device-buyback-platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create `.env` file in root directory:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/buyback_platform
PGHOST=localhost
PGPORT=5432
PGDATABASE=buyback_platform
PGUSER=your_username
PGPASSWORD=your_password

# Application Settings
NODE_ENV=development
PORT=5000

# Optional: External Services
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
SENDGRID_API_KEY=your_sendgrid_key
```

### 4. Database Setup
```bash
# Create database
createdb buyback_platform

# Run migrations and seed data
npm run db:setup
```

### 5. Start Development Server
```bash
npm run dev
```

Application will be available at:
- **Frontend**: http://localhost:5000
- **Admin Panel**: http://localhost:5000/admin
- **API Endpoints**: http://localhost:5000/api

## 📊 Database Schema

### Core Tables

#### Users & Authentication
- `users` - User accounts and authentication
- `sessions` - User session management

#### Partner Network
- `partners` - Partner organizations
- `partner_staff` - Staff members under each partner
- `partner_wallets` - Financial tracking for partners
- `route_rules` - Geographic routing rules for buyback requests

#### Device Management
- `device_types` - Device categories (smartphone, laptop, etc.)
- `brands` - Device manufacturers (Apple, Samsung, etc.)
- `device_models` - Specific device models with pricing
- `device_model_variants` - Storage/color variants

#### Question & Assessment System
- `question_groups` - Categorized question collections
- `questions` - Individual assessment questions with device targeting
- `answer_choices` - Answer options with price impact percentages
- `device_question_mappings` - Model-specific question assignments

#### Transaction Management
- `buyback_requests` - Customer buyback submissions
- `wallet_transactions` - Financial transaction records
- `withdrawal_requests` - Partner withdrawal requests

#### Indian Localization
- `indian_states` - Indian state master data
- `indian_cities` - City data with state relationships
- `indian_postal_codes` - PIN code validation and auto-fill

## 🎯 Key Functionality

### Question Management System

#### 1. Question Groups
Create categorized question collections:
```javascript
// Admin Dashboard → Q&A Management → Question Groups
Categories: screen, battery, physical, functional, connectivity
Device Types: smartphone, tablet, laptop, smartwatch
```

#### 2. Question Builder
Build targeted questions for specific devices:
```javascript
// Device-specific targeting
deviceModelIds: ['2', '3'] // iPhone 13, Samsung Galaxy S24
brandIds: ['1', '2']       // Apple, Samsung
```

#### 3. Answer Impact Configuration
Configure price impacts for each answer choice:
```javascript
answerChoices: [
  { text: "Excellent", impact: 0, severity: "none" },
  { text: "Good", impact: -5, severity: "minor" },
  { text: "Fair", impact: -15, severity: "major" },
  { text: "Poor", impact: -30, severity: "critical" }
]
```

### PIN Code Auto-Fill
Automatic city/state population using Indian Postal Service API:
```javascript
// Format: 6-digit PIN code
// API: https://api.postalpincode.in/pincode/{pinCode}
// Auto-fills: City, State, District
```

### Pricing Calculation
Dynamic pricing based on condition assessment:
```javascript
basePrice = deviceModel.basePrice * 83; // USD to INR
adjustmentFactor = 1 + (totalImpact / 100);
finalPrice = Math.max(minimumPrice, basePrice * adjustmentFactor);
```

## 🔧 API Endpoints

### Question Management
```bash
# Question Groups
GET    /api/question-groups
POST   /api/question-groups
PUT    /api/question-groups/:id
DELETE /api/question-groups/:id

# Questions
GET    /api/questions
POST   /api/questions
PUT    /api/questions/:id
DELETE /api/questions/:id

# Model-specific questions
GET    /api/questions/models?modelIds=1,2,3
GET    /api/questions/brands?brandIds=1,2
```

### Device Management
```bash
# Device Models
GET    /api/device-models
POST   /api/device-models
PUT    /api/device-models/:id

# Brands
GET    /api/brands
POST   /api/brands

# Device Types
GET    /api/device-types
POST   /api/device-types
```

### Assessment & Buyback
```bash
# Condition Questions
GET    /api/condition-questions?deviceType=smartphones&brand=apple&model=iphone-13

# Buyback Requests
POST   /api/buyback-requests
GET    /api/buyback-requests
PUT    /api/buyback-requests/:id
```

## 🏗️ Project Structure

```
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Application pages
│   │   │   ├── admin/       # Admin panel pages
│   │   │   ├── partner/     # Partner portal
│   │   │   └── public/      # Public pages
│   │   ├── contexts/        # React contexts
│   │   └── lib/            # Utilities and configurations
├── server/                   # Node.js backend
│   ├── api/                 # API route handlers
│   ├── middleware/          # Express middleware
│   ├── services/           # Business logic services
│   └── helpers/            # Utility functions
├── shared/                  # Shared types and schemas
│   └── schema.js           # Database schema definitions
├── migrations/             # Database migration files
└── public/                # Static assets
```

## 🔐 Admin Panel Access

### Default Admin Credentials
```
URL: http://localhost:5000/admin/login
Username: admin@buyback.com
Password: admin123
```

### Admin Features
- **Dashboard**: System overview and statistics
- **Device Management**: Brands, models, variants, types
- **Question Management**: Groups, questions, assessments
- **Buyback Management**: Request processing and status tracking
- **Partner Management**: Partner onboarding and staff management
- **User Management**: Customer account administration

## 🧪 Testing & Development

### Question System Testing
1. **Question Groups**: `/admin/question-groups`
2. **Question Builder**: `/admin/question-builder`
3. **Assessment Demo**: `/admin/assessment-demo`
4. **System Status**: `/admin/question-system-demo`

### Sample Test Flow
```bash
# 1. Create question group
curl -X POST http://localhost:5000/api/question-groups \
  -H "Content-Type: application/json" \
  -d '{"name":"Screen Assessment","category":"screen"}'

# 2. Add questions with targeting
curl -X POST http://localhost:5000/api/questions \
  -H "Content-Type: application/json" \
  -d '{"text":"Screen condition?","deviceModelIds":["2"]}'

# 3. Test assessment
curl "http://localhost:5000/api/condition-questions?deviceType=smartphones&brand=apple&model=iphone-13"
```

## 📦 Deployment

### Docker Deployment
```bash
# Build and run with Docker
docker-compose up --build

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:prod_pass@db_host:5432/buyback_db
PORT=80
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check PostgreSQL service
sudo systemctl status postgresql

# Verify connection
psql -h localhost -U username -d buyback_platform
```

#### Port Conflicts
```bash
# Check port usage
lsof -i :5000

# Use different port
PORT=3000 npm run dev
```

#### Missing Dependencies
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📈 Performance Optimization

### Database Indexing
```sql
-- Index frequently queried columns
CREATE INDEX idx_device_models_brand ON device_models(brand_id);
CREATE INDEX idx_questions_group ON questions(question_group_id);
CREATE INDEX idx_buyback_status ON buyback_requests(status);
```

### Caching Strategy
- Redis for session management
- Application-level caching for device models
- CDN for static assets

## 🤝 Contributing

### Development Guidelines
1. Follow existing code structure and naming conventions
2. Add appropriate error handling and logging
3. Update tests for new functionality
4. Document API changes in this README

### Code Quality
```bash
# Run linting
npm run lint

# Run tests
npm run test

# Format code
npm run format
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For technical support or questions:
- Create an issue in the repository
- Check the troubleshooting section above
- Review API documentation in `/docs` folder

---

**Last Updated**: June 2025
**Version**: 2.0.0
**Node.js**: 20+
**Database**: PostgreSQL 14+