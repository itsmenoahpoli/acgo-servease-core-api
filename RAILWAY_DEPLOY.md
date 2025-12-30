# Railway Deployment Guide

This guide explains how to deploy the Servease Core Server to Railway.

## Prerequisites

1. Railway account (sign up at [railway.app](https://railway.app))
2. GitHub repository connected to Railway
3. PostgreSQL database (Railway provides this)

## Deployment Steps

### 1. Create a New Project on Railway

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

### 2. Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically create a PostgreSQL database
4. The `DATABASE_URL` environment variable will be automatically set

### 3. Configure Environment Variables

In Railway project settings, add the following environment variables:

#### Required Variables

```env
NODE_ENV=production
PORT=3000

# Database (automatically set by Railway PostgreSQL service)
# DATABASE_URL is automatically provided

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# OTP Configuration
OTP_EXPIRY_MINUTES=5

# Swagger Authentication
SWAGGER_USERNAME=admin
SWAGGER_PASSWORD=your-secure-password

# CORS Configuration (comma-separated origins, or * for all)
CORS_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com
```

#### Generating JWT Secret

```bash
openssl rand -base64 32
```

### 4. Run Database Migrations

After the first deployment, you need to run migrations:

**Option 1: Using Railway CLI**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run npm run migration:run
```

**Option 2: Using Railway Dashboard**

1. Go to your service in Railway
2. Click on "Deployments"
3. Click on the latest deployment
4. Open the "Shell" tab
5. Run: `npm run migration:run`

### 5. Seed Initial Data (Optional)

To create test accounts:

```bash
railway run npm run seed
```

Or via Railway Dashboard Shell:
```bash
npm run seed
```

### 6. Configure Custom Domain (Optional)

1. In Railway project, go to "Settings"
2. Click "Generate Domain" or add your custom domain
3. Update `CORS_ORIGINS` to include your domain

## Build Configuration

Railway will automatically:
1. Detect Node.js project
2. Run `npm install`
3. Run `npm run build` (via postinstall script)
4. Start the application with `npm run start:prod`

## Deployment Files

- `railway.json` - Railway-specific configuration
- `Procfile` - Process file for Railway
- `nixpacks.toml` - Build configuration (optional, Railway auto-detects)

## Health Check

Railway will automatically check:
- Port: Uses `PORT` environment variable (Railway sets this automatically)
- Health endpoint: `GET /` (returns `{ status: 'ok' }`)

## Monitoring

1. **Logs**: View real-time logs in Railway Dashboard
2. **Metrics**: CPU, Memory, and Network usage
3. **Deployments**: View deployment history and rollback if needed

## Troubleshooting

### Build Fails

- Check build logs in Railway Dashboard
- Ensure all dependencies are in `dependencies` (not `devDependencies`)
- Verify `tsconfig.json` paths are correct

### Database Connection Issues

- Verify `DATABASE_URL` is set (Railway sets this automatically for PostgreSQL services)
- Check database service is running
- Ensure migrations have been run

### Application Crashes

- Check application logs
- Verify all required environment variables are set
- Check database migrations status

### CORS Issues

- Update `CORS_ORIGINS` environment variable
- Include your frontend domain(s)
- Use `*` for development only (not recommended for production)

## Environment-Specific Configuration

### Production Checklist

- [ ] `NODE_ENV=production`
- [ ] Strong `JWT_SECRET` (32+ characters)
- [ ] Production database configured
- [ ] SMTP credentials set
- [ ] `CORS_ORIGINS` configured (not `*`)
- [ ] `SWAGGER_USERNAME` and `SWAGGER_PASSWORD` set
- [ ] Database migrations run
- [ ] Custom domain configured (if needed)

## Continuous Deployment

Railway automatically deploys when you push to your connected branch (usually `main` or `master`).

To disable auto-deploy:
1. Go to project settings
2. Disable "Auto Deploy"

## Rollback

1. Go to "Deployments" in Railway Dashboard
2. Find the previous working deployment
3. Click "Redeploy"

## Support

For Railway-specific issues:
- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)

For application issues:
- Check application logs
- Review error messages
- Verify environment variables

