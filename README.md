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

### For Family Members
- **Read-only Dashboard** - View patient's progress
- **Notifications** - Receive updates about recovery milestones
- **Controlled Access** - Only see what the patient allows

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

### Infrastructure
- **Docker** - Containerization
- **Redis** - Caching and queues (for reminders)

## 📦 Project Structure

```
qr-health/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable components
│   │   │   ├── ui/         # shadcn/ui components
│   │   │   └── layout/     # Layout components
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
│       ├── ai/              # AI assistant
│       └── common/          # Shared utilities
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
