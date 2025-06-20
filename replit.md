# Device Buyback Platform - Replit Guide

## Overview

This is a comprehensive Indian localized device buyback and refurbished electronics marketplace platform. The application allows users to sell their used devices through a question-based assessment system and browse refurbished electronics for purchase. It features partner management, multi-device support, and real-time pricing calculations with Indian market localization.

## System Architecture

### Frontend Architecture
- **Framework**: React.js with TypeScript
- **Styling**: Tailwind CSS with Shadcn/UI components
- **Routing**: React Router for SPA navigation
- **State Management**: React Context API and TanStack Query for server state
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js 20+ with Express.js framework
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful API with organized route handlers
- **Authentication**: Session-based authentication with express-session
- **File Upload**: Multer for handling device images and documents

### Database Architecture
- **Primary Database**: PostgreSQL 14+ with JSONB support for flexible data storage
- **Schema Management**: Drizzle migrations for version control
- **Caching**: Redis for session storage and performance optimization

## Key Components

### Device Assessment System
- **Question Management**: Categorized assessment questions (screen, battery, physical, functional)
- **Device Targeting**: Model-specific and brand-specific question assignment
- **Answer Processing**: Severity levels with impact percentages for price calculation
- **Real-time Pricing**: Dynamic price adjustments based on condition responses

### Partner Network
- **Multi-partner Support**: Partner staff management and buyback routing
- **Wallet System**: Partner earnings tracking and withdrawal management
- **Regional Coverage**: PIN code based service area mapping
- **Commission Structure**: Configurable commission rates per partner

### Indian Market Features
- **Localization**: INR pricing, Indian address formats
- **Geographic Data**: State, city, and PIN code validation
- **GST Integration**: Tax calculation and compliance features
- **Regional Routing**: Location-based partner assignment

### Admin Dashboard
- **Device Management**: Brands, models, and device types administration
- **Question Management**: Assessment question creation and assignment
- **Partner Management**: Partner onboarding and performance tracking
- **Analytics**: Sales reports and platform metrics

## Data Flow

### Device Selling Flow
1. User selects device type and brand from curated database
2. System presents model-specific assessment questions
3. User answers condition questions with real-time price updates
4. Final quote generated based on weighted scoring algorithm
5. Customer details collection and pickup scheduling
6. Order routed to appropriate regional partner

### Assessment Question Flow
1. Questions are categorized by groups (physical, functional, etc.)
2. Device-specific questions mapped through junction tables
3. Answer choices have weighted impact on final pricing
4. Conditional question logic based on previous responses
5. Final score calculation using severity multipliers

### Partner Integration Flow
1. Orders routed based on PIN code and device type
2. Partner staff receives notifications for new orders
3. Pickup coordination and device inspection
4. Payment processing and commission distribution
5. Device refurbishment or recycling handling

## External Dependencies

### Payment Processing
- **Stripe Integration**: For secure payment handling (optional)
- **Configuration**: API keys stored in environment variables
- **Webhooks**: For payment status updates

### Communication Services
- **Twilio SMS**: For order notifications and updates (optional)
- **SendGrid Email**: For transactional emails (optional)
- **Configuration**: Service credentials in environment variables

### File Storage
- **Local Storage**: Images stored in public/uploads directory
- **Multer Configuration**: File type validation and size limits
- **Future Enhancement**: Cloud storage integration ready

### Indian Data Services
- **PIN Code Database**: Comprehensive Indian postal code data
- **State/City Mapping**: Hierarchical location data structure
- **Auto-fill Features**: Address completion based on PIN codes

## Deployment Strategy

### Container Deployment
- **Docker Support**: Multi-stage Dockerfile for production optimization
- **Docker Compose**: Complete stack deployment with PostgreSQL and Redis
- **Health Checks**: Application and database health monitoring
- **Volume Management**: Persistent data storage for uploads and database

### Environment Configuration
- **Development**: Hot reloading with Vite dev server
- **Production**: Optimized builds with static asset serving
- **Environment Variables**: Comprehensive configuration through .env files
- **Security**: Non-root user in production containers

### Database Management
- **Migration System**: Drizzle-kit for schema version control
- **Backup Strategy**: Automated database backups configured
- **Performance**: Indexed queries and connection pooling
- **Scalability**: Read replicas and sharding ready architecture

### Monitoring and Logging
- **Error Tracking**: Built-in error reporting system
- **User Feedback**: Integrated feedback collection
- **Performance Monitoring**: Query optimization and response time tracking
- **Audit Trails**: User action logging for compliance

## Recent Changes

- June 20, 2025: Simplified Advanced Model Management system
  - Removed variant functionality to eliminate database constraint conflicts
  - Kept single AdvancedModelManagement.jsx implementation with essential features
  - Removed AdminModelsAdvanced.jsx and AdminModelVariants.jsx files
  - Simplified model management with inline editing and delete functionality
  - Fixed database unique constraint errors related to model variants
  - Streamlined admin routes for better navigation and reduced complexity

- June 13, 2025: Comprehensive platform upgrade for Indian market
  - Fixed critical database connectivity issues
  - Enhanced lead analytics with Indian social media tracking
  - Added comprehensive Indian market utilities and validation
  - Implemented advanced price calculation algorithms
  - Created market-specific brand preferences and regional adjustments
  - Added support for Indian payment methods and city tier classifications
  - Built fully customizable admin panel with real-time editing capabilities
  - Created advanced question group management with model mappings
  - Added scalable pricing tiers and bulk update functionality

## Changelog

- June 13, 2025. Initial setup and comprehensive upgrade

## User Preferences

Preferred communication style: Simple, everyday language.
Target market: Indian customers with localized features and pricing.