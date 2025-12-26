# 🔐 QR-Health Environment Variables Guide

## Frontend Environment Variables

Create a `.env.local` file in the `frontend/` directory with the following variables:

```env
# ===========================================
# SUPABASE CONFIGURATION (Required)
# ===========================================
# Get these from your Supabase project dashboard:
# Dashboard URL: https://supabase.com/dashboard
# Navigate to: Settings > API

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ===========================================
# BACKEND API CONFIGURATION (Required)
# ===========================================
# URL of the QR-Health backend API

# Development
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Production
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1

# ===========================================
# APP CONFIGURATION
# ===========================================

# App URL (used for redirects and canonical links)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Enable demo mode (allows testing without real authentication)
NEXT_PUBLIC_DEMO_MODE=false

# Analytics (Optional)
NEXT_PUBLIC_GTAG_ID=G_XXXXXXXXXX
```

---

## Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# ===========================================
# SERVER CONFIGURATION
# ===========================================

PORT=3001
NODE_ENV=development

# Frontend URL for CORS configuration
FRONTEND_URL=http://localhost:3000

# Production Frontend
# FRONTEND_URL=https://yourdomain.com

# ===========================================
# SUPABASE CONFIGURATION (Required)
# ===========================================
# Get these from your Supabase project dashboard:
# Dashboard URL: https://supabase.com/dashboard
# Settings > API

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ===========================================
# JWT CONFIGURATION (Required)
# ===========================================
# Generate a strong random string (min 32 characters)
# Use: openssl rand -base64 32

JWT_SECRET=your_jwt_secret_key_here_min_32_chars

# JWT Expiration (default 7 days)
JWT_EXPIRES_IN=7d

# ===========================================
# REDIS CONFIGURATION (Optional but Recommended)
# ===========================================
# Used for OTP storage and session management

# Development
REDIS_URL=redis://localhost:6379

# Production (e.g., Redis Cloud, AWS ElastiCache)
# REDIS_URL=redis://username:password@host:port

# ===========================================
# RESEND EMAIL CONFIGURATION (Required)
# ===========================================
# Get API key from: https://resend.com/dashboard/api-keys

RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Example for development:
# RESEND_FROM_EMAIL=noreply@resend.dev

# ===========================================
# AI SERVICES (Optional)
# ===========================================
# These are used for the AI recovery assistant feature

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Groq AI (Faster inference)
QR_GROQ=your_groq_api_key

# Sarvam AI (For Indian languages)
SARVAM_API_KEY=your_sarvam_api_key

# ===========================================
# LOGGING & DEBUG (Optional)
# ===========================================

# Log level: error, warn, log, debug, verbose
LOG_LEVEL=debug

# Enable request logging
DEBUG=qr-health:*
```

---

## GitHub Secrets (for CI/CD)

Set these secrets in your GitHub repository settings:
**Navigate to:** Settings > Secrets and variables > Actions

```
# Supabase
SUPABASE_SERVICE_ROLE_KEY = your_service_role_key (for migrations)

# Resend Email
RESEND_API_KEY = re_xxxxxxxxxxxxxxxxxxxxxxxxxx

# JWT
JWT_SECRET = your_jwt_secret_key (min 32 chars)

# Cloudflare (for Pages deployment)
CLOUDFLARE_GLOBAL = your_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID = your_account_id

# Vercel (for frontend deployment)
VERCEL_TOKEN = your_vercel_api_token
VERCEL_ORG_ID = your_organization_id
VERCEL_PROJECT_ID = your_project_id
```

---

## Vercel Environment Variables

Set these in your Vercel project settings:
**Navigate to:** Project Settings > Environment Variables

### Production Environment
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_DEMO_MODE=false
```

### Preview Environment
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=https://api-preview.yourdomain.com/api/v1
NEXT_PUBLIC_APP_URL=https://preview.yourdomain.com
NEXT_PUBLIC_DEMO_MODE=true
```

### Development Environment
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEMO_MODE=true
```

---

## Docker Compose Environment

Create a `.env` file in the root directory for docker-compose:

```env
# Frontend
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://backend:3001/api/v1

# Backend
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@resend.dev
REDIS_URL=redis://redis:6379
```

---

## Cloudflare Pages Environment

Set these in Cloudflare Pages settings:
**Navigate to:** Pages > Project Settings > Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## How to Get Each Value

### Supabase Keys
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to Settings > API
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_URL`
   - **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### Resend API Key
1. Go to https://resend.com/dashboard/api-keys
2. Create a new API key
3. Copy the key → `RESEND_API_KEY`
4. Verify your domain for production emails

### Vercel Credentials
1. Go to https://vercel.com/dashboard
2. Account Settings > Tokens
3. Create a new token → `VERCEL_TOKEN`
4. Get your Organization ID and Project ID from project settings

### Cloudflare API Token
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Create API Token with "Edit Cloudflare Pages" permission
3. Copy the token → `CLOUDFLARE_GLOBAL`

### JWT Secret
Generate using:
```bash
openssl rand -base64 32
```

### Google Gemini API Key
1. Go to https://ai.google.dev
2. Click "Get API Key"
3. Create new API key → `GEMINI_API_KEY`

---

## Validation

Run the validation script to check if all required variables are set:

```bash
# Frontend
cd frontend
node validate-production.js

# Backend
cd backend
npm run start:dev
```

---

## Security Best Practices

✅ **DO:**
- Use strong, random values for secrets
- Store secrets in `.env` (git-ignored)
- Rotate secrets periodically
- Use service role keys only in backend
- Enable 2FA on all accounts

❌ **DON'T:**
- Commit `.env` files to Git
- Share API keys in messages/emails
- Use the same secret across environments
- Use weak or predictable values
- Expose service role keys in frontend

---

## Environment-Specific Values

### Development
- `NODE_ENV=development`
- `FRONTEND_URL=http://localhost:3000`
- `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1`
- `NEXT_PUBLIC_DEMO_MODE=true`

### Staging/Preview
- `NODE_ENV=production`
- `FRONTEND_URL=https://staging.yourdomain.com`
- `NEXT_PUBLIC_API_URL=https://api-staging.yourdomain.com/api/v1`
- `NEXT_PUBLIC_DEMO_MODE=false`

### Production
- `NODE_ENV=production`
- `FRONTEND_URL=https://yourdomain.com`
- `NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1`
- `NEXT_PUBLIC_DEMO_MODE=false`

---

## Troubleshooting

### "Missing SUPABASE_URL"
→ Add `SUPABASE_URL` to `.env` (backend)

### "Missing NEXT_PUBLIC_SUPABASE_URL"
→ Add to `.env.local` (frontend)

### "OTP email not sending"
→ Check `RESEND_API_KEY` and `RESEND_FROM_EMAIL`
→ Verify domain in Resend dashboard

### "Redis connection failed"
→ Ensure Redis is running: `redis-cli ping`
→ Check `REDIS_URL` format

### "JWT signature verification failed"
→ Ensure `JWT_SECRET` is the same across all instances
→ Regenerate if changed

---
