# 💾 GadgetSwap Backup & Restore Guide

**Complete backup and restoration procedures for the GadgetSwap Device Buyback Platform**

---

## 📋 Overview

This guide covers comprehensive backup and restoration procedures for your GadgetSwap platform, including database backups, file system backups, and complete system restoration for disaster recovery.

---

## 🗄️ Database Backup & Restore

### Quick Database Backup

```bash
# Create instant database backup
pg_dump $DATABASE_URL > gadgetswap-backup-$(date +%Y%m%d-%H%M%S).sql

# Compressed backup (recommended for large databases)
pg_dump $DATABASE_URL | gzip > gadgetswap-backup-$(date +%Y%m%d-%H%M%S).sql.gz

# Verify backup file
ls -lh gadgetswap-backup-*.sql*
```

### Complete Database Restore

```bash
# Method 1: Restore to new database
createdb gadgetswap_restored
psql gadgetswap_restored < gadgetswap-backup-20250110-120000.sql

# Method 2: Restore to existing database (CAUTION: This will overwrite data)
psql gadgetswap_db < gadgetswap-backup-20250110-120000.sql

# Method 3: Restore compressed backup
gunzip -c gadgetswap-backup-20250110-120000.sql.gz | psql gadgetswap_restored
```

### Schema-Only Backup

```bash
# Backup only database structure (no data)
pg_dump --schema-only $DATABASE_URL > gadgetswap-schema-only.sql

# Restore schema only
psql gadgetswap_new < gadgetswap-schema-only.sql
```

### Data-Only Backup

```bash
# Backup only data (no structure)
pg_dump --data-only $DATABASE_URL > gadgetswap-data-only.sql

# Restore data only (requires existing schema)
psql gadgetswap_db < gadgetswap-data-only.sql
```

---

## 📁 Complete Project Backup

### Full Application Backup

```bash
# Create complete project backup (excluding node_modules)
tar -czf gadgetswap-full-backup-$(date +%Y%m%d-%H%M%S).tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=dist \
  --exclude=logs \
  --exclude=tmp \
  .

# Include database in full backup
pg_dump $DATABASE_URL > database-backup.sql
tar -czf gadgetswap-complete-$(date +%Y%m%d-%H%M%S).tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=dist \
  database-backup.sql \
  .
```

### Critical Files Backup

```bash
# Backup only essential configuration and data
tar -czf gadgetswap-critical-$(date +%Y%m%d-%H%M%S).tar.gz \
  .env \
  package.json \
  package-lock.json \
  shared/ \
  server/ \
  client/ \
  migrations/ \
  *.md \
  *.json \
  Dockerfile \
  docker-compose.yml
```

### Environment-Specific Backup

```bash
# Development backup
tar -czf gadgetswap-dev-$(date +%Y%m%d-%H%M%S).tar.gz \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=.git \
  .

# Production backup (includes logs and uploads)
tar -czf gadgetswap-prod-$(date +%Y%m%d-%H%M%S).tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=tmp \
  .
```

---

## 🔄 Complete System Restoration

### Fresh Installation Restore

```bash
# 1. Extract application files
mkdir gadgetswap-restored
tar -xzf gadgetswap-complete-20250110-120000.tar.gz -C gadgetswap-restored/
cd gadgetswap-restored

# 2. Install dependencies
npm install

# 3. Create database
createdb gadgetswap_db

# 4. Restore database
psql gadgetswap_db < database-backup.sql

# 5. Set up environment
cp .env.example .env
# Edit .env with your settings

# 6. Start application
npm run dev
```

### Production Environment Restore

```bash
# 1. Stop current application
pm2 stop gadgetswap
# or
sudo systemctl stop gadgetswap

# 2. Backup current installation (safety measure)
cp -r /var/www/gadgetswap /var/www/gadgetswap-backup-$(date +%Y%m%d-%H%M%S)

# 3. Extract new files
cd /var/www/
tar -xzf gadgetswap-complete-20250110-120000.tar.gz

# 4. Restore database
pg_dump $DATABASE_URL > current-backup-$(date +%Y%m%d-%H%M%S).sql  # Safety backup
psql $DATABASE_URL < database-backup.sql

# 5. Install dependencies and build
cd /var/www/gadgetswap
npm install
npm run build

# 6. Start application
pm2 start gadgetswap
# or
sudo systemctl start gadgetswap
```

---

## 🔁 Automated Backup Scripts

### Daily Backup Script

Create `backup-daily.sh`:
```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/backups/gadgetswap"
PROJECT_DIR="/var/www/gadgetswap"
DATABASE_URL="postgresql://user:pass@localhost:5432/gadgetswap_db"
RETENTION_DAYS=7

# Create backup directory
mkdir -p $BACKUP_DIR

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Database backup
echo "Creating database backup..."
pg_dump $DATABASE_URL | gzip > $BACKUP_DIR/db-$TIMESTAMP.sql.gz

# Application backup
echo "Creating application backup..."
cd $PROJECT_DIR
tar -czf $BACKUP_DIR/app-$TIMESTAMP.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=dist \
  --exclude=logs \
  --exclude=tmp \
  .

# Clean old backups
echo "Cleaning old backups..."
find $BACKUP_DIR -name "db-*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "app-*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $TIMESTAMP"
```

### Weekly Full Backup Script

Create `backup-weekly.sh`:
```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/backups/gadgetswap/weekly"
PROJECT_DIR="/var/www/gadgetswap"
DATABASE_URL="postgresql://user:pass@localhost:5432/gadgetswap_db"
RETENTION_WEEKS=4

# Create backup directory
mkdir -p $BACKUP_DIR

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Complete system backup
echo "Creating complete system backup..."
cd $PROJECT_DIR

# Database backup
pg_dump $DATABASE_URL > database-backup.sql

# Full application backup including database
tar -czf $BACKUP_DIR/gadgetswap-complete-$TIMESTAMP.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=tmp \
  database-backup.sql \
  .

# Remove temporary database file
rm database-backup.sql

# Clean old backups (keep 4 weeks)
find $BACKUP_DIR -name "gadgetswap-complete-*.tar.gz" -mtime +$(($RETENTION_WEEKS * 7)) -delete

echo "Weekly backup completed: $TIMESTAMP"
```

### Automated Backup Setup

```bash
# Make scripts executable
chmod +x backup-daily.sh backup-weekly.sh

# Add to crontab (crontab -e)
# Daily backup at 2 AM
0 2 * * * /path/to/backup-daily.sh >> /var/log/gadgetswap-backup.log 2>&1

# Weekly backup on Sunday at 3 AM
0 3 * * 0 /path/to/backup-weekly.sh >> /var/log/gadgetswap-backup.log 2>&1

# Monthly cleanup on 1st day at 4 AM
0 4 1 * * find /backups -name "*.tar.gz" -mtime +30 -delete
```

---

## 🔍 Backup Verification & Testing

### Verify Backup Integrity

```bash
# Test database backup
pg_dump $DATABASE_URL > test-backup.sql
psql -d template1 -c "CREATE DATABASE test_restore;"
psql test_restore < test-backup.sql
psql test_restore -c "SELECT COUNT(*) FROM users;" # Should show user count
psql -d template1 -c "DROP DATABASE test_restore;"
rm test-backup.sql

# Test application backup
tar -tzf gadgetswap-backup-20250110-120000.tar.gz | head -20  # List contents
tar -xzf gadgetswap-backup-20250110-120000.tar.gz -C /tmp/test-restore/
ls -la /tmp/test-restore/  # Verify extraction
rm -rf /tmp/test-restore/
```

### Backup Health Check Script

Create `backup-health-check.sh`:
```bash
#!/bin/bash

BACKUP_DIR="/backups/gadgetswap"

echo "=== GadgetSwap Backup Health Check ==="
echo "Date: $(date)"
echo "Backup Directory: $BACKUP_DIR"
echo ""

# Check backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ ERROR: Backup directory does not exist!"
    exit 1
fi

# Check recent database backups
DB_BACKUPS=$(find $BACKUP_DIR -name "db-*.sql.gz" -mtime -1 | wc -l)
echo "Database backups (last 24h): $DB_BACKUPS"
if [ $DB_BACKUPS -eq 0 ]; then
    echo "❌ WARNING: No recent database backups found!"
else
    echo "✅ Database backups OK"
fi

# Check recent application backups
APP_BACKUPS=$(find $BACKUP_DIR -name "app-*.tar.gz" -mtime -1 | wc -l)
echo "Application backups (last 24h): $APP_BACKUPS"
if [ $APP_BACKUPS -eq 0 ]; then
    echo "❌ WARNING: No recent application backups found!"
else
    echo "✅ Application backups OK"
fi

# Check disk space
DISK_USAGE=$(df $BACKUP_DIR | tail -1 | awk '{print $5}' | sed 's/%//')
echo "Backup directory disk usage: ${DISK_USAGE}%"
if [ $DISK_USAGE -gt 90 ]; then
    echo "❌ WARNING: Backup directory is ${DISK_USAGE}% full!"
else
    echo "✅ Disk space OK"
fi

# Check backup sizes
echo ""
echo "Recent backup sizes:"
ls -lh $BACKUP_DIR/db-*.sql.gz | tail -3
ls -lh $BACKUP_DIR/app-*.tar.gz | tail -3

echo ""
echo "=== Health Check Complete ==="
```

---

## 🚀 Disaster Recovery Procedures

### Complete System Recovery

```bash
# 1. Prepare clean system
sudo apt update
sudo apt install nodejs npm postgresql-client

# 2. Download and extract backup
wget https://your-backup-location/gadgetswap-complete-20250110-120000.tar.gz
mkdir recovery-environment
tar -xzf gadgetswap-complete-20250110-120000.tar.gz -C recovery-environment/
cd recovery-environment

# 3. Install dependencies
npm install

# 4. Setup database
createdb gadgetswap_recovery
psql gadgetswap_recovery < database-backup.sql

# 5. Configure environment
cp .env.example .env
# Edit DATABASE_URL to point to gadgetswap_recovery
nano .env

# 6. Test recovery
npm run dev

# 7. If successful, promote to production
# Update DNS, SSL certificates, etc.
```

### Emergency Recovery (Minimal Downtime)

```bash
# 1. Prepare parallel environment
cd /var/www/
tar -xzf gadgetswap-backup-latest.tar.gz -d gadgetswap-recovery/
cd gadgetswap-recovery

# 2. Quick database restore to new database
createdb gadgetswap_emergency
psql gadgetswap_emergency < database-backup.sql

# 3. Update environment for emergency database
sed -i 's/gadgetswap_db/gadgetswap_emergency/g' .env

# 4. Install and build
npm install
npm run build

# 5. Stop old, start new
pm2 stop gadgetswap
cd /var/www/gadgetswap-recovery
pm2 start npm --name "gadgetswap" -- start

# 6. Update web server config if needed
sudo systemctl reload nginx
```

---

## 📊 Backup Monitoring & Alerts

### Backup Monitoring Script

Create `backup-monitor.sh`:
```bash
#!/bin/bash

BACKUP_DIR="/backups/gadgetswap"
ALERT_EMAIL="admin@yourcompany.com"
LOG_FILE="/var/log/backup-monitor.log"

# Function to send alert
send_alert() {
    echo "$1" | mail -s "GadgetSwap Backup Alert" $ALERT_EMAIL
    echo "$(date): ALERT - $1" >> $LOG_FILE
}

# Check if backups are current
LAST_DB_BACKUP=$(find $BACKUP_DIR -name "db-*.sql.gz" -mtime -1 | wc -l)
LAST_APP_BACKUP=$(find $BACKUP_DIR -name "app-*.tar.gz" -mtime -1 | wc -l)

if [ $LAST_DB_BACKUP -eq 0 ]; then
    send_alert "Database backup missing! Last backup older than 24 hours."
fi

if [ $LAST_APP_BACKUP -eq 0 ]; then
    send_alert "Application backup missing! Last backup older than 24 hours."
fi

# Check disk space
DISK_USAGE=$(df $BACKUP_DIR | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 85 ]; then
    send_alert "Backup directory is ${DISK_USAGE}% full! Please clean up old backups."
fi

echo "$(date): Backup monitoring check completed" >> $LOG_FILE
```

### Setup Monitoring Cron

```bash
# Add to crontab (crontab -e)
# Check backups every hour
0 * * * * /path/to/backup-monitor.sh

# Health check every 6 hours
0 */6 * * * /path/to/backup-health-check.sh >> /var/log/backup-health.log
```

---

## 🔧 Backup Optimization

### Incremental Backups

```bash
# Create incremental database backup
# First, create a baseline
pg_dump $DATABASE_URL > baseline-backup.sql

# Then create incremental backups using WAL archiving
# Add to postgresql.conf:
# archive_mode = on
# archive_command = 'cp %p /backup/archive/%f'
# wal_level = replica
```

### Compression Optimization

```bash
# Different compression methods for different scenarios

# Fast compression (less CPU, larger files)
tar -czf backup-fast.tar.gz --exclude=node_modules .

# Best compression (more CPU, smaller files)
tar --use-compress-program="pigz -9" -cf backup-best.tar.gz --exclude=node_modules .

# Database compression comparison
pg_dump $DATABASE_URL | gzip > backup-gzip.sql.gz     # Standard
pg_dump $DATABASE_URL | bzip2 > backup-bzip2.sql.bz2  # Better compression
pg_dump $DATABASE_URL | xz > backup-xz.sql.xz         # Best compression
```

---

## 📋 Backup Best Practices

### Security

- Store backups in multiple locations (local + cloud)
- Encrypt sensitive backups before storage
- Use secure transfer methods (rsync over SSH, encrypted uploads)
- Regularly test backup restoration procedures
- Implement access controls on backup storage

### Performance

- Schedule backups during low-traffic periods
- Use compression to reduce storage space
- Implement incremental backups for large databases
- Monitor backup performance and optimize as needed

### Retention

- Daily backups: Keep for 7 days
- Weekly backups: Keep for 4 weeks
- Monthly backups: Keep for 12 months
- Yearly backups: Keep for legal compliance period

### Documentation

- Document all backup procedures
- Maintain recovery time objectives (RTO)
- Document recovery point objectives (RPO)
- Keep backup logs and monitor for failures

---

**Backup Guide Version**: 2.1.0  
**Last Updated**: January 10, 2025  
**Tested With**: PostgreSQL 14+, Node.js 20+  
**Backup Retention**: 7 days daily, 4 weeks weekly, 12 months yearly