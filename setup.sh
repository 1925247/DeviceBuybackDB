#!/bin/bash

# GadgetSwap Project Setup Script

# Display welcome message
echo "====================================================="
echo "Welcome to GadgetSwap Project Setup"
echo "This script will guide you through setting up your development environment"
echo "====================================================="

# Check for required tools
echo "Checking for required tools..."

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js v18 or later."
    exit 1
else
    NODE_VERSION=$(node -v)
    echo "✓ Node.js is installed: $NODE_VERSION"
fi

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm."
    exit 1
else
    NPM_VERSION=$(npm -v)
    echo "✓ npm is installed: $NPM_VERSION"
fi

# Check for PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠ PostgreSQL is not installed or not in PATH."
    echo "  You'll need to set up PostgreSQL manually or use Docker."
else
    PSQL_VERSION=$(psql --version)
    echo "✓ PostgreSQL client is installed: $PSQL_VERSION"
fi

# Install dependencies
echo -e "\nInstalling project dependencies..."
npm install

# Setup environment variables
echo -e "\nSetting up environment variables..."
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gadgetswap

# Session Configuration
SESSION_SECRET=local_development_secret

# Application Configuration
PORT=5000
NODE_ENV=development
EOF
    echo "✓ Environment file (.env) created."
else
    echo "✓ Environment file (.env) already exists."
fi

# Setup database
echo -e "\nSetting up database..."
echo "Would you like to create and push the database schema? (y/n)"
read -r DB_SETUP

if [ "$DB_SETUP" = "y" ] || [ "$DB_SETUP" = "Y" ]; then
    echo "Running database migrations..."
    npm run db:push
    echo "✓ Database schema created and migrated."
else
    echo "Skipping database setup."
fi

# Setup git
echo -e "\nInitializing git repository..."
if [ -d .git ]; then
    echo "✓ Git repository already initialized."
else
    git init
    git add .
    git commit -m "Initial commit"
    echo "✓ Git repository initialized with initial commit."
fi

# Final instructions
echo -e "\n====================================================="
echo "Setup complete! Here's how to start the application:"
echo ""
echo "1. Start the development server:"
echo "   npm run dev"
echo ""
echo "2. Access the application at:"
echo "   http://localhost:5000"
echo ""
echo "3. Admin login credentials:"
echo "   Email: admin@gadgetswap.com"
echo "   Password: admin123"
echo ""
echo "For deployment instructions, see DEPLOYMENT.md"
echo "For GitHub setup, run ./github-setup.sh"
echo "====================================================="