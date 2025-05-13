# GadgetSwap Deployment Guide

This guide provides instructions for deploying the GadgetSwap platform to various hosting environments.

## Prerequisites

Before deploying, ensure you have:

1. Node.js (v18 or later) installed on your server
2. PostgreSQL database server
3. Environment variables properly configured
4. Build artifacts generated with `npm run build`

## Environment Variables

Create a `.env` file in your production environment with the following variables:

```
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-secure-session-secret
PORT=5000 (or your preferred port)
```

## Deployment Options

### 1. Traditional VPS/Dedicated Server

1. Clone the repository on your server
2. Install dependencies: `npm install --production`
3. Build the application: `npm run build`
4. Set up a process manager like PM2: `npm install -g pm2`
5. Start the application: `pm2 start server/dist/index.js --name gadgetswap`
6. Configure Nginx as a reverse proxy (optional but recommended)

### 2. Docker Deployment

We provide a Dockerfile for containerized deployment:

1. Build the Docker image: `docker build -t gadgetswap:latest .`
2. Run the container: 
   ```
   docker run -d -p 5000:5000 \
     --env-file .env \
     --name gadgetswap-app \
     gadgetswap:latest
   ```

### 3. Heroku Deployment

1. Install Heroku CLI and log in: `heroku login`
2. Create a new Heroku app: `heroku create gadgetswap-app`
3. Add Heroku PostgreSQL addon: `heroku addons:create heroku-postgresql:hobby-dev`
4. Configure environment variables: `heroku config:set SESSION_SECRET=your-secure-secret`
5. Deploy the application: `git push heroku main`

### 4. AWS Elastic Beanstalk

1. Install EB CLI: `pip install awsebcli`
2. Initialize EB project: `eb init`
3. Create an environment: `eb create gadgetswap-env`
4. Configure environment variables using AWS console
5. Deploy the application: `eb deploy`

## Database Migrations

Before starting the application, run migrations to ensure your database schema is up to date:

```
NODE_ENV=production npm run db:migrate
```

## Post-Deployment Verification

After deployment, verify that:

1. The application is accessible at the configured URL
2. Admin login works (admin@gadgetswap.com / admin123)
3. All pages load correctly
4. API endpoints respond properly
5. Database connections are established

## Troubleshooting

If you encounter issues:

1. Check application logs
2. Verify environment variables are correctly set
3. Ensure database connection is working
4. Confirm firewall settings allow traffic on the application port