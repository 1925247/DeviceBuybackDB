# GadgetSwap - Device Buyback & Refurbished Marketplace Platform

GadgetSwap is a sophisticated device buyback and refurbished gadget marketplace platform that empowers sustainable technology consumption through intelligent resale processes and environmental impact tracking.

## Core Features

- **Buyback Program**: Complete flow for device trade-ins with dynamic pricing
- **Marketplace**: Fully functional e-commerce platform for refurbished devices
- **Advanced Admin Panel**: Comprehensive management interface with Shopify-like functionality
- **Multi-Tenant Architecture**: Support for partners with separate databases
- **PIN Code-Based Routing**: Intelligent lead assignment to partners
- **Environmental Impact Tracking**: Calculate and display environmental benefits
- **Dynamic Pricing**: Condition-based assessments with brand-specific questionnaires
- **Region-Based Rules**: Geographic restrictions for products and partners

## Tech Stack

- **Frontend**: React.js with TypeScript
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with real-time synchronization
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **Routing**: React Router v6

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

## Project Structure

- `/client` - Frontend React application
- `/server` - Backend Express API
- `/shared` - Shared types and schemas
- `/migrations` - Database migrations
- `/public` - Static assets

## Admin Credentials

- **Email**: admin@gadgetswap.com
- **Password**: admin123

## License

[MIT](LICENSE)