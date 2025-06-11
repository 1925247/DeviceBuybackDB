# 🚀 Deployment Guide

This guide covers deploying the Device Buyback Platform in various environments.

## 📋 Prerequisites

### System Requirements
- **Server**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: Minimum 20GB SSD
- **Node.js**: Version 20+
- **PostgreSQL**: Version 14+
- **Redis**: Version 6+ (optional but recommended)

### Domain & SSL
- Domain name pointed to your server
- SSL certificate (Let's Encrypt recommended)

## 🐳 Docker Deployment (Recommended)

### 1. Quick Start with Docker Compose

```bash
# Clone repository
git clone <repository-url>
cd device-buyback-platform

# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f app
```

### 2. Environment Configuration

Update `.env` file with production values:

```env
# Production database
DATABASE_URL=postgresql://buyback_user:secure_password@postgres:5432/buyback_platform

# Production settings
NODE_ENV=production
PORT=5000
SESSION_SECRET=your-super-secure-session-secret

# External services
TWILIO_ACCOUNT_SID=your_twilio_sid
SENDGRID_API_KEY=your_sendgrid_key
```

### 3. SSL Setup with Nginx

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:5000;
    }

    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### 4. Start Production Services

```bash
# Start with production profile
docker-compose --profile production up -d

# Scale app instances
docker-compose up -d --scale app=3
```

## 💻 Manual Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Redis
sudo apt install redis-server

# Install Nginx
sudo apt install nginx

# Install PM2 for process management
sudo npm install -g pm2
```

### 2. Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE buyback_platform;
CREATE USER buyback_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE buyback_platform TO buyback_user;
\q

# Import database schema
psql -U buyback_user -d buyback_platform -f database-backup.sql
```

### 3. Application Setup

```bash
# Clone repository
git clone <repository-url>
cd device-buyback-platform

# Install dependencies
npm ci --only=production

# Build application
npm run build

# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env

# Run database migrations
npm run db:migrate
```

### 4. PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'buyback-platform',
    script: 'server/index.ts',
    interpreter: 'node',
    interpreter_args: '--loader tsx',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

Start the application:

```bash
# Create logs directory
mkdir logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
```

### 5. Nginx Configuration

Create `/etc/nginx/sites-available/buyback-platform`:

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

    # Static files
    location /assets/ {
        alias /path/to/app/public/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/buyback-platform /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 6. SSL Certificate with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## ☁️ Cloud Platform Deployment

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Configure environment variables in Vercel dashboard

### Railway Deployment

1. Connect GitHub repository to Railway
2. Set environment variables
3. Deploy automatically on push

### DigitalOcean App Platform

1. Create new app from GitHub
2. Configure build settings:
   - Build Command: `npm run build`
   - Run Command: `npm start`
3. Add database component (PostgreSQL)
4. Configure environment variables

## 🔧 Production Optimizations

### 1. Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_buyback_requests_status ON buyback_requests(status);
CREATE INDEX CONCURRENTLY idx_buyback_requests_created ON buyback_requests(created_at);
CREATE INDEX CONCURRENTLY idx_questions_group_active ON questions(question_group_id, active);

-- Configure PostgreSQL for production
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET wal_buffers = '16MB';
SELECT pg_reload_conf();
```

### 2. Application Caching

Enable Redis caching in `.env`:

```env
REDIS_URL=redis://localhost:6379
ENABLE_CACHING=true
CACHE_TTL_SHORT=300
CACHE_TTL_MEDIUM=1800
CACHE_TTL_LONG=3600
```

### 3. Monitoring Setup

```bash
# Install monitoring tools
npm install -g clinic

# Performance monitoring
clinic doctor -- node server/index.js

# Setup log rotation
sudo nano /etc/logrotate.d/buyback-platform
```

## 🔍 Health Checks

### Application Health Endpoint

The application includes a health check endpoint at `/api/health`:

```bash
# Check application health
curl http://localhost:5000/api/health
```

### Database Health Check

```bash
# Check database connection
psql -U buyback_user -d buyback_platform -c "SELECT 1;"
```

### PM2 Monitoring

```bash
# Monitor processes
pm2 monit

# Check logs
pm2 logs

# Restart application
pm2 restart all
```

## 🔄 Backup Strategy

### 1. Database Backups

```bash
# Create backup script
cat > backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backups/db_backup_$DATE.sql
# Keep only last 30 days
find backups/ -name "db_backup_*.sql" -mtime +30 -delete
EOF

chmod +x backup-db.sh

# Add to crontab for daily backups
echo "0 2 * * * /path/to/backup-db.sh" | crontab -
```

### 2. File Backups

```bash
# Backup uploads directory
rsync -av uploads/ backups/uploads/

# Backup configuration files
tar -czf backups/config_$(date +%Y%m%d).tar.gz .env ecosystem.config.js
```

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**:
```bash
sudo lsof -i :5000
sudo kill -9 <PID>
```

2. **Database connection failed**:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -U buyback_user -d buyback_platform -h localhost
```

3. **Out of memory errors**:
```bash
# Increase swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

4. **SSL certificate issues**:
```bash
# Renew certificate
sudo certbot renew

# Test certificate
sudo certbot certificates
```

### Performance Issues

1. **Slow database queries**:
```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();
```

2. **High memory usage**:
```bash
# Monitor memory usage
free -h
top -p $(pgrep -f "node")

# Restart application
pm2 restart all
```

## 📊 Monitoring & Maintenance

### 1. Log Management

```bash
# Application logs
tail -f logs/combined.log

# System logs
sudo journalctl -u nginx -f
sudo journalctl -u postgresql -f
```

### 2. Performance Monitoring

```bash
# Server resources
htop
iotop
nethogs

# Application metrics
pm2 monit
```

### 3. Security Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js dependencies
npm audit
npm update

# Update PM2
pm2 update
```

## 📝 Post-Deployment Checklist

- [ ] Application starts successfully
- [ ] Database connection working
- [ ] All API endpoints responding
- [ ] SSL certificate configured
- [ ] Backup system set up
- [ ] Monitoring tools configured
- [ ] Log rotation enabled
- [ ] Security headers configured
- [ ] Admin panel accessible
- [ ] Question system functional
- [ ] PIN code auto-fill working
- [ ] Email/SMS notifications working

---

For additional support, refer to the main [README.md](README.md) or create an issue in the repository.