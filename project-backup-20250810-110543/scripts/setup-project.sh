#!/bin/bash

# GadgetSwap Complete Project Setup Script
# This script sets up the entire GadgetSwap project from backup

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 GadgetSwap Complete Project Setup"
echo "===================================="
echo "Setting up from: $PROJECT_ROOT"
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found! Please install Node.js 20+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found! Please install npm"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL client not found! Please install PostgreSQL"
    exit 1
fi

echo "✅ All prerequisites found"
echo ""

# Setup database
echo "🗄️ Setting up database..."
cd "$SCRIPT_DIR"
./restore-database.sh gadgetswap_db

if [ $? -ne 0 ]; then
    echo "❌ Database setup failed!"
    exit 1
fi

# Setup environment
echo "⚙️ Setting up environment..."
cd "$PROJECT_ROOT"

if [ ! -f ".env" ]; then
    if [ -f "environment/.env.example" ]; then
        cp "environment/.env.example" ".env"
        echo "✅ Environment file created from example"
        echo "📝 Please edit .env file with your database credentials"
    else
        echo "❌ No environment example file found!"
        exit 1
    fi
else
    echo "ℹ️ Environment file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
if [ -f "environment/package.json" ]; then
    cp "environment/package.json" "."
    cp "environment/package-lock.json" "." 2>/dev/null || true
    
    npm install
    
    if [ $? -eq 0 ]; then
        echo "✅ Dependencies installed successfully"
    else
        echo "❌ Dependency installation failed!"
        exit 1
    fi
else
    echo "❌ package.json not found in backup!"
    exit 1
fi

echo ""
echo "🎉 GadgetSwap setup complete!"
echo ""
echo "📋 Setup Summary:"
echo "Database: gadgetswap_db"
echo "Admin user: admin@buyback.com / admin123"
echo ""
echo "🎯 To start the application:"
echo "1. Edit .env file with your database URL"
echo "2. Run: npm run dev"
echo "3. Open: http://localhost:5000"
echo ""
echo "📚 Documentation available in: documentation/"
echo "🔧 Additional scripts available in: scripts/"