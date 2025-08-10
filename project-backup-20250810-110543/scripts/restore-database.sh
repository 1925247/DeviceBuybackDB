#!/bin/bash

# GadgetSwap Database Restoration Script
# Usage: ./restore-database.sh [database_name]

DATABASE_NAME=${1:-gadgetswap_db}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATABASE_DIR="$SCRIPT_DIR/../database"

echo "🚀 GadgetSwap Database Restoration"
echo "=================================="
echo "Target database: $DATABASE_NAME"
echo "Script location: $SCRIPT_DIR"
echo ""

# Check if backup files exist
if [ ! -f "$DATABASE_DIR/project-database-backup.sql" ]; then
    echo "❌ Error: Database backup file not found!"
    echo "Expected: $DATABASE_DIR/project-database-backup.sql"
    exit 1
fi

# Check if PostgreSQL is available
if ! command -v psql &> /dev/null; then
    echo "❌ Error: PostgreSQL client (psql) not found!"
    echo "Please install PostgreSQL client tools"
    exit 1
fi

# Create database if it doesn't exist
echo "📝 Creating database: $DATABASE_NAME"
createdb "$DATABASE_NAME" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Database created successfully"
else
    echo "ℹ️  Database already exists, will restore to existing database"
fi

# Restore database
echo "📊 Restoring database from backup..."
psql "$DATABASE_NAME" < "$DATABASE_DIR/project-database-backup.sql"

if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully!"
    echo ""
    echo "📋 Database Summary:"
    psql "$DATABASE_NAME" -c "SELECT schemaname,tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;"
    echo ""
    echo "👤 Admin user available:"
    echo "Email: admin@buyback.com"
    echo "Password: admin123"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Update your .env file with DATABASE_URL"
    echo "2. Run: npm install"
    echo "3. Run: npm run dev"
else
    echo "❌ Database restoration failed!"
    exit 1
fi