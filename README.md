# QR-Health - Recovery Companion

> Your trusted recovery companion. Track progress, stay on schedule, and recover with confidence.

## 🧠 About

QR-Health is a **Recovery Companion Web App** designed to help patients track their post-surgery recovery journey. It provides:

- ✔ **Education** - Understand your recovery process
- ✔ **Reminders** - Never miss medications or exercises
- ✔ **Progress Tracking** - Monitor your recovery journey
- ✔ **Warnings** - Get alerts when something needs attention
- ✔ **Emotional Support** - AI assistant for recovery questions

> **Important**: QR-Health is NOT a medical diagnosis or treatment service. Always consult your healthcare provider for medical decisions.

## 🚀 Features

### For Patients
- **Dashboard** - Daily overview of medications, exercises, and recovery score
- **Recovery Progress** - Track pain levels, mood, and recovery trends
- **Medication Management** - Schedule and log medications
- **Exercise Tracking** - Follow prescribed exercises with instructions
- **AI Recovery Assistant** - Get answers about recovery (with safety filters)
- **Family Sharing** - Control what family members can see
- **Daily Check-in** - Log mood, pain, and swelling status
- **Quick Actions** - Handle reminders with Done/Skip/Snooze

### For Family Members
- **Read-only Dashboard** - View patient's progress
- **Notifications** - Receive updates about recovery milestones
- **Controlled Access** - Only see what the patient allows

### Onboarding Flow
- **Consent & Disclaimer** - DPDP-compliant data consent
- **Recovery Setup** - Configure recovery type and start date
- **Reminder Preferences** - Customize notification settings

### Multi-Tenant SaaS Features
- **Organization Management** - Support for clinics, hospitals, and healthcare providers
- **Subscription Tiers** - Free, Basic, Professional, and Enterprise plans
- **Row Level Security** - Complete data isolation between tenants
- **API Keys** - External integrations with rate limiting
- **Audit Logging** - Compliance-ready activity tracking

## 🔧 Environment Configuration

### GitHub Repository Secrets
Set these secrets in your GitHub repository settings:
- `PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `PUBLIC_SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (backend only)

### Frontend Environment Variables
Create `.env.local` in the frontend directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend Environment Variables
Create `.env` in the backend directory:
```env
SUPABASEURL=your_supabase_project_url
SUPABASEKEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### GitHub Organization Secrets (Cloud AI)
Set these secrets at the organization level:
- `GEMINI_API_KEY` - Google Gemini API key
- `QR_GROQ` - Groq API key
- `SARVAM_API_KEY` - Sarvam AI API key

## 🗄️ Database Setup (Supabase)

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and API keys from Settings > API

### 2. Run Database Migrations
1. Go to Supabase Dashboard > SQL Editor
2. Run the migrations in order:
   - `supabase/migrations/00001_create_schema.sql` - Main schema with multi-tenancy
   - `supabase/migrations/00002_seed_data.sql` - Seed data for development

### 3. Database Schema Overview

The schema includes:

| Table | Description |
|-------|-------------|
| `tenants` | Organizations/clinics using the platform |
| `users` | All users linked to Supabase Auth |
| `patient_profiles` | Extended patient information |
| `consent_records` | DPDP-compliant consent tracking |
| `recovery_profiles` | Individual recovery journeys |
| `task_schedules` | Medicine, exercise, meal reminders |
| `task_completions` | Daily completion tracking |
| `daily_recovery_logs` | Daily check-in data |
| `viewer_access` | Family/friend sharing controls |
| `medications` | Patient medications |
| `medication_logs` | Medication adherence |
| `exercises` | Patient exercises |
| `exercise_logs` | Exercise completion |
| `notification_logs` | Notification history |
| `ai_interaction_logs` | AI chat logs (isolated) |
| `milestones` | Recovery achievements |
| `audit_logs` | Compliance audit trail |
| `api_keys` | External API access |

### 4. Row Level Security (RLS)
All tables have RLS policies that enforce:
- **Tenant isolation** - Users can only access data within their organization
- **Patient ownership** - Patients control their own health data
- **Role-based access** - Doctors and admins have appropriate permissions
- **Family viewer restrictions** - Limited, controlled access for family members

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with SSR
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Accessible component library
- **Radix UI** - Headless UI primitives
- **Zustand** - State management
- **Supabase SSR** - Authentication helpers

### Backend
- **NestJS** - Enterprise-grade Node.js framework
- **TypeScript** - Type-safe development
- **Passport JWT** - Authentication
- **class-validator** - Request validation
- **Supabase** - Database (PostgreSQL) + Auth
- **Multi-Provider AI** - Gemini, Groq, Sarvam, OpenAI, Anthropic, or Local (Ollama)

### Database
- **PostgreSQL** - Via Supabase
- **Row Level Security** - Multi-tenant isolation
- **Realtime** - Live updates (optional)

### Infrastructure
- **Docker** - Containerization
- **Redis** - Caching and queues (for reminders)

## 📦 Project Structure

```
qr-health/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App router pages
│   │   │   ├── auth/        # Login & Signup
│   │   │   ├── dashboard/   # Patient dashboard
│   │   │   ├── recovery/    # Recovery tracking
│   │   │   ├── medications/ # Medication management
│   │   │   ├── exercises/   # Exercise tracking
│   │   │   ├── ai-assistant/# AI chat interface
│   │   │   ├── family/      # Family sharing settings
│   │   │   ├── family-dashboard/  # Family read-only view
│   │   │   ├── settings/    # User settings
│   │   │   ├── onboarding/  # Onboarding flow
│   │   │   │   ├── consent/ # Consent & disclaimer
│   │   │   │   ├── recovery-setup/ # Recovery config
│   │   │   │   └── reminder-preferences/ # Notification settings
│   │   │   ├── daily-checkin/  # Daily mood/pain check
│   │   │   ├── task/        # Task detail & actions
│   │   │   └── quick-action/# Quick action from notifications
│   │   ├── components/      # Reusable components
│   │   │   ├── ui/         # shadcn/ui components
│   │   │   ├── layout/     # Layout components
│   │   │   └── safety/     # Safety warning components
│   │   ├── lib/            # Utilities & stores
│   │   │   ├── store/      # Zustand stores
│   │   │   └── supabase/   # Supabase clients
│   │   └── types/          # TypeScript types
│   └── public/              # Static assets
│
├── backend/                  # NestJS backend
│   └── src/
│       ├── auth/            # Authentication module
│       ├── users/           # User management
│       ├── recovery/        # Recovery tracking
│       ├── medications/     # Medication management
│       ├── exercises/       # Exercise tracking
│       ├── reminders/       # Reminder system
│       ├── family/          # Family sharing
│       ├── ai/              # AI assistant (multi-provider)
│       ├── common/          # Shared utilities
│       │   └── supabase/    # Supabase service
│       └── types/           # Database types
│
├── supabase/                 # Supabase configuration
│   ├── config.toml          # Project config
│   └── migrations/          # SQL migrations
│       ├── 00001_create_schema.sql  # Main schema
│       └── 00002_seed_data.sql      # Seed data
│
└── docker-compose.yml       # Docker orchestration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- Docker (optional, for deployment)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/QuantumRishi/qr-health.git
   cd qr-health
   ```

2. **Set up the Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   npm run dev
   ```

3. **Set up the Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run start:dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Using Demo Accounts

The app includes demo accounts for testing:
- **Patient Demo** - Access all patient features
- **Family Demo** - View family member dashboard

## 🐳 Docker Deployment

```bash
# Build and run all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d
```

## 🔐 Privacy & Security

QR-Health follows privacy-first principles:

- ✔ **Data Encryption** - All data encrypted at rest
- ✔ **HTTPS Only** - Secure communication
- ✔ **Role-Based Access** - Patients control data sharing
- ✔ **Consent Management** - Explicit opt-in for data processing
- ✔ **Delete My Data** - Users can delete all their data
- ✔ **DPDP Compliant** - Follows India's Digital Personal Data Protection Act

## 🤖 AI Safety

The AI Recovery Assistant has built-in safety rules:

- ❌ No medical diagnoses
- ❌ No prescription changes
- ❌ No medication recommendations
- ⚠️ Pain warnings trigger doctor referrals
- ✔ Educational content only
- ✔ Emotional support
- ✔ Recovery tips

## 📝 API Documentation

### Authentication
- `POST /api/v1/auth/send-otp` - Send OTP to email
- `POST /api/v1/auth/verify-otp` - Verify OTP and get token
- `POST /api/v1/auth/register` - Register new user

### Users
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update profile
- `DELETE /api/v1/users/me` - Delete account

### Recovery
- `GET /api/v1/recovery` - Get recovery history
- `POST /api/v1/recovery` - Log daily progress
- `GET /api/v1/recovery/dashboard` - Get dashboard stats

### Medications
- `GET /api/v1/medications` - List all medications
- `POST /api/v1/medications` - Add medication
- `GET /api/v1/medications/schedule/today` - Today's schedule
- `POST /api/v1/medications/:id/log` - Log medication taken

### Exercises
- `GET /api/v1/exercises` - List all exercises
- `POST /api/v1/exercises` - Add exercise
- `GET /api/v1/exercises/schedule/today` - Today's schedule
- `POST /api/v1/exercises/:id/log` - Log exercise completed

### Family
- `GET /api/v1/family` - List family members
- `POST /api/v1/family` - Add family member
- `PUT /api/v1/family/:id/permissions` - Update permissions

### AI
- `POST /api/v1/ai/chat` - Chat with AI assistant

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software by Quantum Rishi.

## 🙏 Acknowledgments

- Built with ❤️ for patients and their families
- Designed with privacy and safety in mind
- Inspired by real-world healthcare needs

---

**Disclaimer**: QR-Health is a recovery companion app, not a medical diagnosis or treatment service. Always consult your healthcare provider for medical decisions. Do not use this app to diagnose conditions or change your prescribed treatment.
