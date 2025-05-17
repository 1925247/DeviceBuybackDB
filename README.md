# GadgetSwap - Device Buyback & Refurbished Marketplace Platform

GadgetSwap is a sophisticated device buyback and refurbished gadget marketplace platform that leverages advanced technology to create an intuitive and sustainable consumer electronics exchange experience.

## Core Features

- **Buyback Program**: Complete flow for device trade-ins with dynamic pricing based on condition assessment
- **Marketplace**: Fully functional e-commerce platform for refurbished devices with inventory management
- **Advanced Admin Panel**: Comprehensive management interface with Shopify-like functionality
- **Multi-Tenant Architecture**: Support for partners with separate databases and customizable storefronts
- **PIN Code-Based Routing**: Intelligent lead assignment to partners based on geographic location
- **Environmental Impact Tracking**: Calculate and display environmental benefits of device recycling
- **Dynamic Pricing**: Condition-based assessments with brand-specific questionnaires
- **Region-Based Rules**: Geographic restrictions for products and partners

## Tech Stack

- **Frontend**: React.js with TypeScript
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **Routing**: React Router DOM

## Key Modules

### 1. Buyback Management
- **Device Selection**: Intuitive flow for selecting device type, brand, and model
- **Condition Assessment**: Dynamic questionnaires based on device type and brand
- **Instant Valuation**: Real-time pricing based on device condition and market value
- **Request Management**: Track buyback requests from submission to completion

### 2. Partner Management
- **Partner Dashboard**: Dedicated interface for partners to manage inventory and requests
- **Commission Setup**: Configure tiered commission structures for partners
- **Lead Routing**: PIN code-based assignment of buyback requests to partners
- **Payment Processing**: Manage partner payments and wallet transactions

### 3. Device Management
- **Device Catalog**: Comprehensive database of device types, brands, and models
- **Condition Questions**: Configure assessment questionnaires for accurate valuations
- **Pricing Rules**: Set base prices and condition-based adjustments by device
- **Variant Management**: Handle different storage capacities and configurations

### 4. Marketplace
- **Product Listings**: Showcase refurbished devices with detailed specifications
- **Shopping Cart**: Seamless checkout experience with multiple payment options
- **Order Management**: Track orders from placement to fulfillment
- **Customer Accounts**: User registration, profile management, and order history

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- PostgreSQL database

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/gadgetswap.git
cd gadgetswap
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables (create .env file in the root directory)
```
DATABASE_URL=postgresql://username:password@localhost:5432/gadgetswap
SESSION_SECRET=your-secure-session-secret
```

4. Run database migrations
```bash
npm run db:push
```

5. Start the development server
```bash
npm run dev
```

## Database Schema Overview

The database schema is designed around several core entities:

- **device_types**: Categories of devices (e.g., Smartphones, Tablets, Laptops)
- **brands**: Device manufacturers (e.g., Apple, Samsung, Google)
- **device_models**: Specific models of devices with their characteristics
- **products**: Marketplace listings with pricing and inventory information
- **question_groups**: Groups of condition assessment questions
- **questions**: Individual condition questions for buyback assessment
- **answer_choices**: Possible answers for condition questions with value impact
- **product_question_mappings**: Associations between products and assessment questions
- **buyback_requests**: Customer requests to sell their devices
- **orders**: Customer purchases of refurbished devices
- **users**: User accounts for customers, admins, and partners
- **partners**: Partner organizations that participate in the buyback program

## Project Structure

- `/client` - Frontend React application
  - `/src/components` - Reusable UI components
  - `/src/contexts` - React context providers
  - `/src/hooks` - Custom React hooks
  - `/src/pages` - Page components organized by feature
  - `/src/lib` - Utility functions and API clients
  
- `/server` - Backend Express API
  - `/api` - API route handlers organized by resource
  - `/middleware` - Express middleware
  - `/storage.ts` - Database access layer
  - `/db.ts` - Database connection setup
  
- `/shared` - Shared types and schemas
  - `/schema.ts` - Database schema definitions using Drizzle ORM
  
- `/migrations` - Database migrations
- `/public` - Static assets

## Admin Credentials

- **Email**: admin@gadgetswap.com
- **Password**: admin123

## API Reference

The API follows RESTful principles and is organized by resource:

- `/api/device-types` - Device category endpoints
- `/api/brands` - Device brand endpoints
- `/api/device-models` - Device model endpoints
- `/api/condition-questions` - Condition assessment question endpoints
- `/api/buyback-requests` - Buyback request management
- `/api/products` - Marketplace product management
- `/api/orders` - Order management
- `/api/users` - User management
- `/api/partners` - Partner management
- `/api/indian` - Indian geographic data (states, cities, PIN codes)

## GitHub Synchronization

To keep your GitHub repository in sync with changes made in Replit:

1. Use `./track-changes.sh` to identify modified files
2. Use `./export-changes.sh` to export only modified files as a ZIP
3. Use `./update-github.sh` to create a complete project export

See [GITHUB-SYNC.md](GITHUB-SYNC.md) for detailed instructions.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Project Status

See [PROJECT-STATUS.md](PROJECT-STATUS.md) for current development status and roadmap.

## License

[MIT](LICENSE)