# Railway Deployment Troubleshooting

This document helps diagnose and fix common Railway deployment issues.

## ✅ Fixed Issues

### 1. Build Errors
**Problem:** TypeScript compilation was failing due to test file errors.

**Fix:**
- Added `exclude` to `tsconfig.json` to exclude test files from build
- Test files are now only compiled when running tests

**Files Changed:**
- `tsconfig.json` - Added exclude for test files

### 2. Path Mapping Issues
**Problem:** `@/entities` import was not resolving correctly.

**Fix:**
- Added explicit `@/entities` path mapping (without `/*`) to `tsconfig.json`
- This allows `import * as entities from '@/entities'` to work

**Files Changed:**
- `tsconfig.json` - Added `"@/entities": ["src/app/entities"]` mapping

### 3. Production Migration Commands
**Problem:** Migration commands were using `ts-node` which isn't available in production.

**Fix:**
- Created production migration commands that use compiled JavaScript
- `migration:run` now uses `dist/database/data-source.js`
- Added `:dev` variants for development

**Files Changed:**
- `package.json` - Updated migration scripts

### 4. Missing Production Dependencies
**Problem:** `tsconfig-paths` was only in devDependencies but needed for migrations.

**Fix:**
- Moved `tsconfig-paths` to dependencies

**Files Changed:**
- `package.json` - Moved tsconfig-paths to dependencies

## 🔍 Common Railway Log Errors

### Error: "Cannot find module '@/entities'"
**Solution:** Already fixed. If you see this, ensure:
- `tsconfig.json` has the `@/entities` mapping
- Build completed successfully
- Files are in `src/app/entities/`

### Error: "Database connection failed"
**Solution:**
- Verify `DATABASE_URL` is set (Railway sets this automatically for PostgreSQL services)
- Check PostgreSQL service is running
- Verify database credentials

### Error: "Migration files not found"
**Solution:**
- Run `npm run build` first
- Check `dist/database/migrations/` exists
- Use `npm run migration:run` (production command)

### Error: "Port already in use"
**Solution:**
- Railway sets `PORT` automatically - don't hardcode it
- Use `process.env.PORT ?? 3000` in code

### Error: "Module not found" in production
**Solution:**
- Ensure all runtime dependencies are in `dependencies` (not `devDependencies`)
- Run `npm ci --only=production` locally to test

## 📋 Pre-Deployment Checklist

- [ ] Build succeeds locally: `npm run build`
- [ ] Production start works: `NODE_ENV=production npm run start:prod`
- [ ] All environment variables documented
- [ ] Database migrations tested
- [ ] No hardcoded paths or URLs
- [ ] CORS origins configured

## 🚀 Deployment Verification

After deployment, check:

1. **Build Logs:**
   - Should show "Successfully compiled"
   - No TypeScript errors

2. **Runtime Logs:**
   - Application starts without errors
   - Database connection successful
   - Server listening on port

3. **Health Check:**
   ```bash
   curl https://your-app.railway.app/
   # Should return: {"status":"ok"}
   ```

4. **API Documentation:**
   ```bash
   curl https://your-app.railway.app/api
   # Should prompt for Swagger auth
   ```

## 🔧 Quick Fixes

### Rebuild after code changes:
```bash
# In Railway dashboard, trigger a new deployment
# Or via CLI:
railway up
```

### Run migrations manually:
```bash
railway run npm run migration:run
```

### Check environment variables:
```bash
railway variables
```

### View logs:
```bash
railway logs
# Or in Railway dashboard
```

## 📞 Still Having Issues?

1. Check Railway build logs for specific errors
2. Verify all environment variables are set
3. Ensure database service is running
4. Check application logs for runtime errors
5. Verify build output in `dist/` directory

