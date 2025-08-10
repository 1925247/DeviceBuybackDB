# 📱 GadgetSwap - Device Buyback Platform

<div align="center">

![Node.js](https://img.shields.io/badge/node.js-20+-green.svg)
![React](https://img.shields.io/badge/react-18.3+-blue.svg)
![PostgreSQL](https://img.shields.io/badge/postgresql-14+-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-supported-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

*A comprehensive device buyback and refurbished electronics marketplace with intelligent assessment, partner management, and Indian market localization*

</div>

## 🚀 What is GadgetSwap?

GadgetSwap is a full-featured device buyback platform that revolutionizes how people sell and buy refurbished electronics. Built specifically for the Indian market, it features intelligent device assessment, real-time pricing, partner network management, and comprehensive admin controls.

### ✨ Key Highlights

- **🎯 Smart Assessment**: AI-powered device evaluation with condition-specific pricing
- **🤝 Partner Network**: Multi-partner staff management with regional routing
- **🇮🇳 Indian Market Ready**: INR pricing, PIN code validation, GST integration
- **⚡ Real-time Pricing**: Dynamic price calculations based on device condition
- **📊 Advanced Analytics**: Comprehensive reporting and business intelligence
- **🛡️ Enterprise Security**: Session-based auth, role-based access control

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │────│  Express API    │────│   PostgreSQL    │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ • React Router  │    │ • RESTful API   │    │ • Drizzle ORM   │
│ • TailwindCSS   │    │ • Authentication│    │ • Migrations    │
│ • Shadcn/UI     │    │ • File Upload   │    │ • Indexing      │
│ • TanStack Query│    │ • Session Mgmt  │    │ • JSONB Support │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ 
- **PostgreSQL** 14+
- **npm** or **yarn**

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd device-buyback-platform

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your database and service credentials

# 4. Initialize database
npm run db:push

# 5. Start development server
npm run dev
```

🎉 **Your app is now running!**
- **Frontend & API**: http://localhost:5000
- **Admin Panel**: http://localhost:5000/admin
- **Agent Portal**: http://localhost:5000/agent

## 🌟 Core Features

### 🔧 Device Assessment System
- **Question Groups**: Categorized assessments (screen, battery, physical, functional)
- **Smart Targeting**: Model-specific and brand-specific question assignment  
- **Impact Scoring**: Answer choices with percentage-based price adjustments
- **Live Demo**: Built-in testing interface for question validation

### 👥 Multi-Tenant Partner Network
- **Partner Management**: Onboard and manage multiple business partners
- **Staff Hierarchy**: Partner owners, managers, and staff with different access levels
- **Regional Routing**: Automatic order assignment based on PIN codes
- **Wallet System**: Track earnings, commissions, and withdrawal requests

### 🇮🇳 Indian Market Localization
- **Currency**: INR pricing with dynamic USD conversion
- **Geography**: Complete PIN code, city, and state database
- **Auto-fill**: Address completion using postal codes
- **Compliance**: GST-ready tax calculations

### 📊 Advanced Admin Controls
- **Device Management**: Brands, models, variants, and device types
- **Question Builder**: Visual interface for creating assessment flows
- **Order Management**: Track and process buyback requests
- **Analytics Dashboard**: Sales reports and business intelligence

## 🏗️ Project Structure

```
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Route-based page components
│   │   │   ├── admin/         # Admin panel pages
│   │   │   ├── agent/         # Agent portal pages
│   │   │   ├── partner/       # Partner management
│   │   │   └── sell/          # Device selling flow
│   │   ├── contexts/          # React Context providers
│   │   ├── hooks/             # Custom React hooks
│   │   └── lib/               # Utilities and configurations
│
├── server/                     # Node.js Backend
│   ├── api/                   # API route handlers
│   │   ├── deviceModels.js    # Device management endpoints
│   │   ├── questionsApi.js    # Question system APIs
│   │   └── partnerStaff.js    # Partner management APIs
│   ├── services/              # Business logic services
│   ├── middleware/            # Express middleware
│   └── utils/                 # Server utilities
│
├── shared/                     # Shared Code
│   └── schema.js              # Database schema definitions
│
├── migrations/                 # Database Migrations
└── attached_assets/           # Project documentation & guides
```

## 🗄️ Database Schema

### Core Data Models

```sql
-- User Management
users                    # Customer & admin accounts
sessions                 # Authentication sessions

-- Partner Network  
partners                 # Partner organizations
partner_staff           # Staff under partners
partner_wallets         # Financial tracking
route_rules             # Geographic routing

-- Device Catalog
device_types            # Categories (phone, laptop, etc.)
brands                  # Manufacturers (Apple, Samsung)
device_models           # Specific models with pricing
device_model_variants   # Storage/color options

-- Assessment System
question_groups         # Question categories
questions               # Assessment questions
answer_choices          # Answer options with impact
device_question_mappings # Model-specific assignments

-- Transaction Management
buyback_requests        # Customer orders
wallet_transactions     # Financial records
withdrawal_requests     # Partner payouts

-- Indian Localization
indian_states           # State master data  
indian_cities           # City relationships
indian_postal_codes     # PIN code validation
```

## 🔌 API Reference

### Device Management
```bash
GET    /api/device-models              # List all device models
POST   /api/device-models              # Create new device model
PUT    /api/device-models/:id          # Update device model
DELETE /api/device-models/:id          # Delete device model

GET    /api/brands                     # List all brands
POST   /api/brands                     # Create new brand
GET    /api/device-types               # List device categories
```

### Assessment System
```bash
GET    /api/questions                  # List all questions
POST   /api/questions                  # Create new question
PUT    /api/questions/:id              # Update question
DELETE /api/questions/:id              # Delete question

GET    /api/condition-questions        # Get questions for device
       ?deviceType=smartphones&brand=apple&model=iphone-13
       
GET    /api/question-groups            # List question groups  
POST   /api/question-groups            # Create question group
```

### Order Management
```bash
GET    /api/buyback-requests           # List all orders
POST   /api/buyback-requests           # Create new order
PUT    /api/buyback-requests/:id       # Update order status
DELETE /api/buyback-requests/:id       # Cancel order

GET    /api/partner-staff              # List partner staff
POST   /api/partner-staff              # Add staff member
```

## ⚙️ Configuration

### Environment Variables

```env
# Database Configuration
DATABASE_URL=postgresql://user:pass@localhost:5432/buyback_db
PGHOST=localhost
PGPORT=5432
PGDATABASE=buyback_db
PGUSER=your_username
PGPASSWORD=your_password

# Application Settings
NODE_ENV=development
PORT=5000

# Optional Services (for production)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token  
SENDGRID_API_KEY=your_sendgrid_key
STRIPE_SECRET_KEY=your_stripe_key
```

### Default Admin Access
```
URL: http://localhost:5000/admin/login
Email: admin@buyback.com
Password: admin123
```

## 🧪 Testing & Development

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm run test:unit
npm run test:integration
```

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:push      # Push schema changes
npm run lint         # Run code linting
npm run format       # Format code
```

### Question System Testing
Access these admin interfaces to test the assessment system:
- **Question Groups**: `/admin/question-groups`
- **Question Builder**: `/admin/question-builder` 
- **Assessment Demo**: `/admin/assessment-demo`
- **System Status**: `/admin/question-system-demo`

## 🚀 Deployment

### Docker Deployment (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up --build

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment

```bash
# Build the application
npm run build

# Set production environment
export NODE_ENV=production
export DATABASE_URL=your_production_db_url

# Start the server
npm start
```

### Health Checks

The application includes built-in health monitoring:
- **App Health**: `GET /health`
- **Database Health**: `GET /api/health/db`
- **API Status**: `GET /api/health`

## 🎯 Key Business Flows

### Device Selling Flow
1. **Device Selection**: User chooses device type → brand → model
2. **Condition Assessment**: System presents model-specific questions
3. **Real-time Pricing**: Price updates with each answer
4. **Customer Details**: Collection of contact and address info
5. **Order Placement**: Quote confirmation and pickup scheduling
6. **Partner Assignment**: Order routed based on location
7. **Completion**: Device pickup, payment, and feedback

### Partner Onboarding Flow  
1. **Partner Registration**: Business details and verification
2. **Staff Management**: Add team members with roles
3. **Service Areas**: Define coverage regions by PIN codes
4. **Commission Setup**: Configure earnings and fees
5. **Order Processing**: Receive and manage buyback requests
6. **Wallet Management**: Track earnings and withdrawals

## 📊 Business Intelligence

### Built-in Analytics
- **Revenue Tracking**: Daily, weekly, monthly sales reports
- **Device Performance**: Most popular devices and brands
- **Partner Analytics**: Performance metrics per partner
- **Customer Insights**: User behavior and satisfaction
- **Geographic Analysis**: Regional performance data

### Custom Reports
Access comprehensive reporting through the admin dashboard:
- **Sales Reports**: `/admin/reports/sales`
- **Partner Performance**: `/admin/reports/partners`  
- **Device Analytics**: `/admin/reports/devices`
- **Customer Analysis**: `/admin/reports/customers`

## 🔒 Security Features

### Authentication & Authorization
- **Session-based Auth**: Secure session management with express-session
- **Role-based Access**: Customer, admin, partner, and staff roles
- **Password Security**: Bcrypt hashing with salt rounds
- **Session Storage**: PostgreSQL session store for scalability

### Data Protection
- **Input Validation**: Zod schema validation on all inputs
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
- **XSS Protection**: Input sanitization and CSP headers
- **File Upload Security**: Type and size validation for uploads

## 🛠️ Development Tools

### Code Quality
- **ESLint**: Code linting and style enforcement
- **Prettier**: Automatic code formatting
- **TypeScript**: Type safety for better development experience
- **Husky**: Pre-commit hooks for code quality

### Database Tools
- **Drizzle Studio**: Visual database browser and editor
- **Migrations**: Version controlled schema changes
- **Seeding**: Development data population scripts
- **Backup**: Automated backup procedures

## 📈 Performance Optimization

### Frontend Optimization
- **Code Splitting**: Lazy loading for admin and partner routes
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Image Optimization**: Automatic image compression and lazy loading
- **Caching Strategy**: Service worker for offline functionality

### Backend Optimization
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: PostgreSQL connection management
- **Caching**: Redis integration for session and data caching
- **Query Optimization**: Drizzle ORM query optimization

### Production Monitoring
- **Error Tracking**: Built-in error reporting system
- **Performance Metrics**: Response time and throughput monitoring
- **Database Monitoring**: Query performance and connection tracking
- **User Analytics**: Usage patterns and feature adoption

## 🤝 Contributing

### Development Guidelines
1. **Code Standards**: Follow existing patterns and naming conventions
2. **Testing**: Write tests for new features and bug fixes
3. **Documentation**: Update README and inline documentation
4. **Pull Requests**: Use descriptive titles and detailed descriptions

### Getting Started with Development
```bash
# Fork the repository and clone your fork
git clone https://github.com/yourusername/device-buyback-platform.git

# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes and test thoroughly
npm run test
npm run lint

# Commit with descriptive messages
git commit -m "Add: new feature description"

# Push and create a pull request
git push origin feature/your-feature-name
```

## 📋 Roadmap

### Upcoming Features
- **Mobile App**: React Native mobile application
- **AI Integration**: Automated device condition assessment
- **Blockchain**: Supply chain tracking and authenticity verification
- **Multi-language**: Support for regional Indian languages
- **Advanced Analytics**: Machine learning insights and predictions

### Known Issues & Limitations
- **File Storage**: Currently uses local storage (cloud integration planned)
- **Email Templates**: Basic HTML templates (rich templates in development)
- **Mobile Optimization**: Some admin pages need mobile responsiveness improvements
- **Search**: Basic search functionality (advanced search planned)

## 📞 Support & Community

### Getting Help
- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join community discussions for questions and ideas
- **Email**: Contact team at support@gadgetswap.com

### Troubleshooting
Common issues and solutions:

**Database Connection Issues**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Verify connection string
psql $DATABASE_URL
```

**Port Conflicts**
```bash
# Check what's using port 5000
lsof -i :5000

# Use different port
PORT=3000 npm run dev
```

**Missing Dependencies**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ for the future of electronics commerce**

[Report Bug](../../issues) · [Request Feature](../../issues) · [Join Community](../../discussions)

</div>

---

**Last Updated**: January 2025 • **Version**: 2.1.0 • **Node.js**: 20+ • **Database**: PostgreSQL 14+