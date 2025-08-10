# 🚀 GadgetSwap Installation & Deployment Guide

**Complete setup guide for the GadgetSwap Device Buyback Platform**

---

## 📋 Table of Contents

1. [Quick Setup (5 minutes)](#-quick-setup)
2. [Detailed Installation](#-detailed-installation) 
3. [Database Setup](#-database-setup)
4. [Environment Configuration](#-environment-configuration)
5. [Production Deployment](#-production-deployment)
6. [Backup & Restoration](#-backup--restoration)
7. [Troubleshooting](#-troubleshooting)

---

## 🚀 Quick Setup

### Prerequisites
- **Node.js** 20+
- **PostgreSQL** 14+
- **Git** for version control

### 5-Minute Installation

```bash
# 1. Clone repository
git clone https://github.com/your-username/gadgetswap-buyback-platform.git
cd gadgetswap-buyback-platform

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your database credentials

# 4. Create and setup database
createdb gadgetswap_db
npm run db:setup

# 5. Start development server
npm run dev
```

✅ **Your app is now running at http://localhost:5000**

---

## 📦 Detailed Installation

### System Requirements

**Minimum Requirements**
- Node.js 20.0+
- PostgreSQL 14.0+
- 4GB RAM
- 10GB disk space
- Linux/macOS/Windows

**Recommended Requirements**  
- Node.js 20.10+
- PostgreSQL 15.0+
- 8GB RAM
- 50GB disk space
- Linux Ubuntu 20.04+ or macOS 12+

### Step-by-Step Installation

#### 1. Install Dependencies

**Node.js 20+**
```bash
# Using NodeSource (Linux)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Using Homebrew (macOS)
brew install node@20

# Verify installation
node --version  # Should be 20.x or higher
npm --version   # Should be 10.x or higher
```

**PostgreSQL 14+**
```bash
# Linux (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS with Homebrew
brew install postgresql@14
brew services start postgresql@14

# Windows - Download from https://www.postgresql.org/download/windows/

# Verify installation
psql --version  # Should be 14.x or higher
```

#### 2. Clone and Setup Project

```bash
# Clone repository
git clone https://github.com/your-username/gadgetswap-buyback-platform.git
cd gadgetswap-buyback-platform

# Install all dependencies
npm install

# Verify installation
npm list --depth=0  # Check installed packages
```

---

## 🗄️ Database Setup

### Option 1: Automatic Setup (Recommended)

```bash
# Create database
createdb gadgetswap_db

# Run complete setup (schema + seed data)
npm run db:setup

# Verify tables were created
psql gadgetswap_db -c "\dt"
```

### Option 2: Manual Database Setup

```bash
# Create database
createdb gadgetswap_db

# Import schema
psql gadgetswap_db < database-schema.sql

# Run migrations
npm run db:push

# Seed with sample data (optional)
npm run db:seed
```

### Option 3: Import from Backup

```bash
# Create database
createdb gadgetswap_db

# Import backup (if you have one)
psql gadgetswap_db < project-database-backup.sql

# Verify import
psql gadgetswap_db -c "SELECT COUNT(*) FROM users;"
```

### Database Schema Verification

```sql
-- Connect to database
psql gadgetswap_db

-- Check all tables
\dt

-- Verify key tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check admin user exists
SELECT * FROM users WHERE role = 'admin';
```

---

## ⚙️ Environment Configuration

### Create Environment File

```bash
# Copy example environment
cp .env.example .env

# Edit with your settings
nano .env  # or use your preferred editor
```

### Complete Environment Setup

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/gadgetswap_db
PGHOST=localhost
PGPORT=5432
PGDATABASE=gadgetswap_db
PGUSER=your_username
PGPASSWORD=your_password

# Application Settings
NODE_ENV=development
PORT=5000

# Session Security
SESSION_SECRET=your-super-secret-session-key-change-in-production

# Optional: Payment Processing
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Optional: Communication Services
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

SENDGRID_API_KEY=SG.your_sendgrid_api_key
FROM_EMAIL=noreply@yourapp.com

# Optional: File Storage
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_KEY_FILE=path/to/service-account.json
GOOGLE_CLOUD_STORAGE_BUCKET=your-bucket-name

# Optional: Analytics
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

### Environment Validation

```bash
# Test database connection
npm run db:test

# Validate all environment variables
npm run env:validate
```

---

## 🌐 Production Deployment

### Docker Deployment (Recommended)

```bash
# Build Docker image
docker build -t gadgetswap:latest .

# Run with Docker Compose
docker-compose up -d

# Check container status
docker-compose ps
```

**docker-compose.yml**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/gadgetswap
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=gadgetswap
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database-schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
    restart: unless-stopped

volumes:
  postgres_data:
```

### Manual Production Deployment

```bash
# Build application
npm run build

# Set production environment
export NODE_ENV=production
export DATABASE_URL=your_production_database_url

# Start production server
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start npm --name "gadgetswap" -- start
pm2 startup
pm2 save
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 💾 Backup & Restoration

### Creating Backups

```bash
# Database backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# Full application backup
tar -czf gadgetswap-backup-$(date +%Y%m%d-%H%M%S).tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=dist \
  .

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d-%H%M%S)
pg_dump $DATABASE_URL > $BACKUP_DIR/db-$DATE.sql
tar -czf $BACKUP_DIR/app-$DATE.tar.gz --exclude=node_modules .
```

### Restoring from Backup

```bash
# Restore database
createdb gadgetswap_restored
psql gadgetswap_restored < backup-20250110-120000.sql

# Restore application files
tar -xzf gadgetswap-backup-20250110-120000.tar.gz -C /path/to/restore/

# Update environment and restart
cd /path/to/restore/
npm install
npm run db:push
npm start
```

### Automated Backup with Cron

```bash
# Add to crontab (crontab -e)
0 2 * * * /path/to/backup-script.sh  # Daily at 2 AM
0 2 * * 0 /path/to/weekly-cleanup.sh  # Weekly cleanup
```

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U your_username -d gadgetswap_db

# Check if database exists
psql -l | grep gadgetswap

# Reset database
dropdb gadgetswap_db
createdb gadgetswap_db
psql gadgetswap_db < database-schema.sql
```

#### Port Already in Use

```bash
# Find what's using port 5000
lsof -i :5000

# Kill the process
kill -9 PID

# Use different port
PORT=3000 npm run dev
```

#### Permission Issues

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Fix PostgreSQL permissions
sudo -u postgres createuser --superuser $USER
sudo -u postgres createdb $USER
```

#### Missing Dependencies

```bash
# Clear npm cache
npm cache clean --force

# Delete and reinstall
rm -rf node_modules package-lock.json
npm install

# Fix peer dependencies
npm install --legacy-peer-deps
```

#### Environment Variables Not Loading

```bash
# Check .env file exists
ls -la .env

# Verify contents
cat .env

# Test environment loading
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"
```

### Performance Optimization

```bash
# Database optimization
psql gadgetswap_db -c "VACUUM ANALYZE;"
psql gadgetswap_db -c "REINDEX DATABASE gadgetswap_db;"

# Node.js memory optimization
NODE_OPTIONS="--max_old_space_size=4096" npm start

# Enable compression
sudo apt install nginx
# Configure gzip in nginx.conf
```

### Monitoring & Logs

```bash
# Application logs
tail -f logs/application.log

# Database logs (Linux)
tail -f /var/log/postgresql/postgresql-15-main.log

# System resources
top
htop
df -h
free -h

# Process monitoring
ps aux | grep node
ps aux | grep postgres
```

---

## 🔍 Development Commands

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:push      # Push schema changes
npm run db:setup     # Complete database setup
npm run db:seed      # Seed with sample data
npm run db:reset     # Reset database
npm run db:backup    # Create database backup

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Maintenance
npm run clean        # Clean build files
npm run analyze      # Analyze bundle size
npm audit            # Security audit
npm update           # Update dependencies
```

### Admin Access

**Default Admin Credentials**
```
URL: http://localhost:5000/admin/login
Email: admin@buyback.com  
Password: admin123
```

**Change Admin Password**
```bash
# Using psql
psql gadgetswap_db -c "UPDATE users SET password_hash = crypt('new_password', gen_salt('bf')) WHERE email = 'admin@buyback.com';"

# Or through admin interface
# Login → Settings → Change Password
```

---

## 📞 Support & Resources

### Getting Help

- **Documentation**: Check README.md and code comments
- **Issues**: Report bugs via GitHub Issues  
- **Community**: Join discussions for questions and ideas
- **Email**: Contact support@gadgetswap.com

### Useful Links

- **GitHub Repository**: https://github.com/your-username/gadgetswap-buyback-platform
- **Live Demo**: https://demo.gadgetswap.com
- **Documentation**: https://docs.gadgetswap.com
- **API Reference**: https://api.gadgetswap.com/docs

---

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] Database created and migrated
- [ ] SSL certificate installed
- [ ] Domain name pointed to server
- [ ] Firewall rules configured
- [ ] Backup strategy implemented

### Security Checklist

- [ ] Changed default admin password
- [ ] Updated session secret
- [ ] Configured HTTPS
- [ ] Set up rate limiting  
- [ ] Enabled security headers
- [ ] Configured CORS properly

### Performance Checklist

- [ ] Database indexes created
- [ ] Caching configured
- [ ] CDN setup for static assets
- [ ] Compression enabled
- [ ] Monitoring tools installed
- [ ] Log rotation configured

---

**Installation Guide Version**: 2.1.0  
**Last Updated**: January 10, 2025  
**Compatible Platforms**: Linux, macOS, Windows  
**Node.js**: 20+ | **PostgreSQL**: 14+ | **npm**: 10+