# 🚀 QR-Health Production Deployment Guide

**Status:** Ready for Production (with critical fixes applied)  
**Last Updated:** December 21, 2025

---

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Step 1: Supabase Setup](#step-1-supabase-setup)
3. [Step 2: Resend Email Setup](#step-2-resend-email-setup)
4. [Step 3: Database Migrations](#step-3-database-migrations)
5. [Step 4: Backend Deployment](#step-4-backend-deployment)
6. [Step 5: Frontend Deployment](#step-5-frontend-deployment)
7. [Step 6: Cloudflare & DNS](#step-6-cloudflare--dns)
8. [Step 7: GitHub Actions](#step-7-github-actions)
9. [Step 8: Post-Deployment Testing](#step-8-post-deployment-testing)
10. [Troubleshooting](#troubleshooting)

---

## 📋 Pre-Deployment Checklist

### Local Testing (Do First)
- [ ] Run `npm install` in both `frontend/` and `backend/`
- [ ] Create `.env` file in `backend/` with all required variables
- [ ] Create `.env.local` file in `frontend/` with all required variables
- [ ] Run `docker-compose up` without errors
- [ ] Frontend loads at `http://localhost:3000`
- [ ] Backend responds at `http://localhost:3001/api/v1/health`
- [ ] Can send OTP: `curl -X POST http://localhost:3001/api/v1/auth/send-otp`
- [ ] Can verify OTP: `curl -X POST http://localhost:3001/api/v1/auth/verify-otp`
- [ ] Run tests: `npm run test` (backend), `npm run lint` (frontend)

### Services Required
- [x] Supabase Account (https://supabase.com)
- [x] Resend Account (https://resend.com)
- [x] Vercel Account (https://vercel.com)
- [x] Cloudflare Account (https://cloudflare.com)
- [x] GitHub Account with repository

---

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in:
   - **Project Name:** qr-health
   - **Database Password:** Use strong password (copy to `.env`)
   - **Region:** Choose closest to your users
4. Click "Create"
5. Wait for project to initialize (2-3 minutes)

### 1.2 Get API Keys

1. Go to **Settings > API**
2. Copy these values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY = eyJhbGc... (keep secret)
   ```

### 1.3 Enable JWT Auth

1. Go to **Settings > Auth > Providers > Email**
2. Enable "Email/Password"
3. Enable "Email verification" (optional)
4. Go to **Policies > JWT Settings**
5. Set JWT secret (copy to `JWT_SECRET` in `.env`)

---

## Step 2: Resend Email Setup

### 2.1 Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up with your email
3. Verify email address

### 2.2 Get API Key

1. Go to **Dashboard > API Keys**
2. Create new API key
3. Copy: `re_xxxxxxxxxxxxxxxxxxxxxxxx` → `RESEND_API_KEY`

### 2.3 Setup Domain (for Production)

1. Go to **Domains**
2. Click "Add Domain"
3. Enter your domain: `yourdomain.com`
4. Add DNS records shown:
   ```
   Type    Name             Value
   MX      yourdomain.com   feedback-smtp.yourdomain.com
   CNAME   feedback-smtp    feedback-smtp.resend.dev
   TXT     (SPF)            v=spf1 include:sendingdomain.resend.dev ~all
   ```
5. Click "Verify"
6. Copy verified domain email: `noreply@yourdomain.com` → `RESEND_FROM_EMAIL`

### 2.4 Test Email Sending (Dev)

For development, use the default domain:
```env
RESEND_FROM_EMAIL=noreply@resend.dev
```

---

## Step 3: Database Migrations

### 3.1 Run Migrations

1. Go to Supabase **SQL Editor**
2. Click **"New Query"**
3. Copy contents from [supabase/migrations/00001_create_schema.sql](supabase/migrations/00001_create_schema.sql)
4. Paste and click **"RUN"**
5. Wait for completion ✅
6. Repeat for [supabase/migrations/00002_seed_data.sql](supabase/migrations/00002_seed_data.sql)

### 3.2 Verify Schema

Go to **Table Editor** and verify these tables exist:
- [ ] `tenants`
- [ ] `users`
- [ ] `patient_profiles`
- [ ] `medications`
- [ ] `exercises`
- [ ] `reminders`
- [ ] `recovery_profiles`

---

## Step 4: Backend Deployment

### Option A: Deploy to Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Create Backend Project:**
   ```bash
   cd backend
   vercel
   ```
   - Select "Vercel"
   - Link to GitHub repo
   - Select "backend" as root directory

4. **Set Environment Variables:**
   ```bash
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add JWT_SECRET
   vercel env add RESEND_API_KEY
   vercel env add RESEND_FROM_EMAIL
   vercel env add REDIS_URL
   vercel env add NODE_ENV=production
   ```

5. **Deploy:**
   ```bash
   vercel --prod
   ```

### Option B: Deploy to Railway.app

1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Create new project from repo
4. Add environment variables
5. Deploy

### Option C: Deploy with Docker

1. **Build Docker image:**
   ```bash
   docker build -t qr-health-backend ./backend
   ```

2. **Push to Docker registry:**
   ```bash
   docker tag qr-health-backend yourrepo/qr-health-backend
   docker push yourrepo/qr-health-backend
   ```

3. **Deploy to your server** (AWS, DigitalOcean, etc.)

### Verify Backend

```bash
curl https://your-backend-url/api/v1/health

# Expected response:
# { "status": "ok" }
```

---

## Step 5: Frontend Deployment

### 5.1 Update Environment Variables

Update `frontend/.env.local` with production values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=https://your-backend-url/api/v1
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_DEMO_MODE=false
```

### 5.2 Deploy to Vercel (Recommended)

1. **Login to Vercel:**
   ```bash
   vercel login
   ```

2. **Deploy Frontend:**
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Set Environment Variables in Vercel Dashboard:**
   - Go to Project Settings > Environment Variables
   - Add all variables for Production environment

### 5.3 Deploy to Cloudflare Pages

1. **Install Wrangler:**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

3. **Update wrangler.jsonc:**
   ```jsonc
   {
     "name": "qr-health",
     "env": {
       "production": {
         "routes": [
           {
             "pattern": "yourdomain.com/**",
             "zone_name": "yourdomain.com"
           }
         ]
       }
     }
   }
   ```

4. **Deploy:**
   ```bash
   wrangler deploy --env production
   ```

---

## Step 6: Cloudflare & DNS

### 6.1 Add Domain to Cloudflare

1. Go to [cloudflare.com/dashboard](https://cloudflare.com/dashboard)
2. Click "Add a Site"
3. Enter domain: `yourdomain.com`
4. Select free plan
5. Cloudflare will show nameservers

### 6.2 Update Nameservers

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Find "Nameserver" settings
3. Replace with Cloudflare nameservers:
   ```
   ns1.cloudflare.com
   ns2.cloudflare.com
   ```
4. Wait for propagation (5-48 hours)

### 6.3 Create DNS Records

In Cloudflare Dashboard > DNS:

```
Type   Name              Content                    TTL
A      yourdomain.com    your-vercel-ip            Auto
CNAME  www               yourdomain.com.vercel.com Auto
CNAME  api               your-backend-ip           Auto
CNAME  app               yourdomain.com.vercel.com Auto
```

### 6.4 SSL/TLS Configuration

1. Go to **SSL/TLS > Overview**
2. Set to "Full" (encrypted)
3. Go to **SSL/TLS > Edge Certificates**
4. Enable "Always Use HTTPS"
5. Enable "Automatic HTTPS Rewrites"

### 6.5 Configure Page Rules

1. Go to **Rules > Page Rules**
2. Add rule:
   ```
   Pattern: api.yourdomain.com/*
   - Cache Level: Bypass
   - Browser Cache TTL: Off
   ```

---

## Step 7: GitHub Actions

### 7.1 Add GitHub Secrets

1. Go to **Settings > Secrets and variables > Actions**
2. Add these secrets:

```
SUPABASE_SERVICE_ROLE_KEY = your_service_role_key
RESEND_API_KEY = re_xxxxxxxxxxxxxxxxxxxxxxxx
JWT_SECRET = your_jwt_secret
CLOUDFLARE_GLOBAL = your_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID = your_account_id
VERCEL_TOKEN = your_vercel_token
VERCEL_ORG_ID = your_org_id
VERCEL_PROJECT_ID = your_project_id
```

### 7.2 Update Workflow

Update `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: vercel/action@v5
        with:
          working-directory: backend
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-frontend:
    runs-on: ubuntu-latest
    needs: deploy-backend
    steps:
      - uses: actions/checkout@v4
      - uses: vercel/action@v5
        with:
          working-directory: frontend
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## Step 8: Post-Deployment Testing

### 8.1 Verify Services

```bash
# Check backend health
curl https://api.yourdomain.com/api/v1/health

# Check frontend loads
curl -I https://yourdomain.com

# Test Supabase connection
curl https://api.yourdomain.com/api/v1/users
```

### 8.2 Test Authentication Flow

1. Go to `https://yourdomain.com`
2. Click "Login"
3. Enter test email
4. Check email for OTP (from Resend)
5. Enter OTP
6. Verify redirect to dashboard
7. Check JWT token in localStorage

### 8.3 Test Features

- [ ] Login/Signup flow
- [ ] Dashboard loads data
- [ ] Can add medication
- [ ] Can add exercise
- [ ] Can log daily check-in
- [ ] Reminders work
- [ ] Family sharing works
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] AI assistant responds

### 8.4 Monitor Errors

1. Vercel: Go to Deployments > Functions > Logs
2. Cloudflare: Go to Analytics > Overview
3. Resend: Go to Dashboard > Emails (check sent/bounced)

---

## Troubleshooting

### Issue: "OTP email not sending"

**Solution:**
1. Check `RESEND_API_KEY` is correct
2. Verify domain in Resend dashboard
3. Check spam folder
4. Test with `resend.dev` domain first
5. Check email logs in Resend dashboard

### Issue: "Database connection error"

**Solution:**
1. Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
2. Check Supabase project is active
3. Verify IP whitelist (if any)
4. Run migrations again

### Issue: "JWT signature verification failed"

**Solution:**
1. Ensure `JWT_SECRET` matches across all instances
2. Regenerate JWT secret if changed
3. Clear browser cache
4. Check token expiration time

### Issue: "CORS errors"

**Solution:**
1. Update `FRONTEND_URL` in backend `.env`
2. Check CORS configuration in `main.ts`
3. Verify backend is responding
4. Check Cloudflare CORS rules

### Issue: "Vercel deployment fails"

**Solution:**
1. Check `node_modules` isn't in git
2. Verify environment variables are set
3. Check logs in Vercel dashboard
4. Ensure `next.config.ts` doesn't have `output: "export"`

### Issue: "DNS not resolving"

**Solution:**
1. Check nameservers propagated (use https://dnschecker.org)
2. Wait 24-48 hours for full propagation
3. Check DNS records in Cloudflare
4. Clear local DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)

---

## Performance Optimization

### Cloudflare Cache Settings

1. Go to **Caching > Caching Rules**
2. Create rules:
   ```
   Path: /api/* → Cache Level: Bypass
   Path: /_next/static/* → Cache: Cached, 1 month TTL
   Path: /public/* → Cache: Cached, 1 month TTL
   ```

### Vercel Speed Insights

1. Go to project **Analytics > Performance**
2. Monitor Core Web Vitals
3. Optimize images and bundles

### Database Query Optimization

1. Add indexes in Supabase:
   ```sql
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_medications_user_id ON medications(user_id);
   CREATE INDEX idx_reminders_user_id ON reminders(user_id);
   ```

---

## Monitoring & Alerts

### Setup Monitoring

1. **Vercel:** Enable edge monitoring in project settings
2. **Sentry (Optional):** Add error tracking
3. **Resend:** Monitor email delivery
4. **Cloudflare:** Enable notifications

### Setup Alerts

```bash
# Monitor backend uptime
curl -f https://api.yourdomain.com/api/v1/health || alert "Backend down"

# Monitor database
# Use Supabase dashboard > Realtime > Events
```

---

## Maintenance

### Weekly Tasks
- [ ] Check Vercel deployments
- [ ] Review Resend email stats
- [ ] Monitor Cloudflare analytics
- [ ] Check Supabase query performance

### Monthly Tasks
- [ ] Review error logs
- [ ] Update dependencies: `npm update`
- [ ] Run security audit: `npm audit`
- [ ] Backup database (Supabase handles this)

### Quarterly Tasks
- [ ] Rotate secrets
- [ ] Review and optimize database indexes
- [ ] Check for breaking changes in dependencies
- [ ] Performance audit and optimization

---

## Rollback Plan

If something goes wrong:

```bash
# Rollback Vercel
vercel rollback

# Revert database changes
# Go to Supabase > SQL Editor > undo migrations

# Revert DNS
# Update nameservers back to original registrar

# Clear caches
# Cloudflare > Caching > Clear Cache
```

---

## Success Criteria

✅ **Your deployment is successful when:**

- Backend health check responds: `GET /api/v1/health`
- Frontend loads at custom domain
- Can login with OTP
- Email is received from Resend
- Dashboard shows user data
- Mobile version is responsive
- No errors in Vercel logs
- DNS resolves correctly
- SSL certificate is valid
- Performance scores are good

---

**🎉 Congratulations! Your QR-Health app is now in production!**

For issues or questions, check our [E2E_CHECKLIST.md](E2E_CHECKLIST.md) or contact support.

---
