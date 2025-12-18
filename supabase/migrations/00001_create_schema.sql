-- ============================================================
-- QR-HEALTH MULTI-TENANT SAAS DATABASE SCHEMA
-- Version: 1.0.0
-- Database: PostgreSQL (Supabase)
-- ============================================================
-- 
-- MULTI-TENANCY DESIGN:
-- - Each organization (tenant) has isolated data
-- - Row Level Security (RLS) enforces tenant isolation
-- - Supports clinic chains, hospitals, individual practices
-- 
-- SCHEMA DESIGN PRINCIPLES:
-- - Patient is the data owner within their tenant
-- - Explicit consent is stored, versioned, auditable
-- - Family viewers never access raw health data
-- - AI logs are separated from health records
-- - Hard medical data is minimal by design
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================

-- User roles within the system
CREATE TYPE user_role AS ENUM ('patient', 'family_viewer', 'doctor', 'clinic_admin', 'super_admin');

-- Subscription tiers for multi-tenant SaaS
CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'professional', 'enterprise');

-- Subscription status
CREATE TYPE subscription_status AS ENUM ('active', 'trial', 'past_due', 'cancelled', 'suspended');

-- Recovery types
CREATE TYPE recovery_type AS ENUM ('bone_fracture', 'surgery', 'injury', 'physiotherapy', 'other');

-- Task types for reminders
CREATE TYPE task_type AS ENUM ('medicine', 'exercise', 'meal', 'hydration', 'custom');

-- Task frequency
CREATE TYPE task_frequency AS ENUM ('once', 'daily', 'twice_daily', 'three_times_daily', 'weekly', 'custom');

-- Task completion status
CREATE TYPE task_status AS ENUM ('pending', 'done', 'skipped', 'missed');

-- Mood values
CREATE TYPE mood_type AS ENUM ('great', 'good', 'ok', 'low', 'struggling');

-- Swelling status
CREATE TYPE swelling_status AS ENUM ('none', 'mild', 'moderate', 'severe');

-- Recovery trend
CREATE TYPE recovery_trend AS ENUM ('improving', 'stable', 'warning', 'critical');

-- Consent types
CREATE TYPE consent_type AS ENUM ('data_storage', 'data_processing', 'family_sharing', 'analytics', 'notifications', 'marketing');

-- Viewer access level
CREATE TYPE access_level AS ENUM ('summary_only', 'detailed', 'full');

-- Notification update frequency
CREATE TYPE update_frequency AS ENUM ('realtime', 'daily', 'weekly', 'milestone_only');

-- Notification types
CREATE TYPE notification_type AS ENUM ('reminder', 'alert', 'milestone', 'warning', 'daily_summary', 'weekly_summary');

-- Notification channels
CREATE TYPE notification_channel AS ENUM ('push', 'email', 'sms', 'whatsapp', 'in_app');

-- Notification status
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'read');

-- AI intent types
CREATE TYPE ai_intent_type AS ENUM ('education', 'emotional_support', 'schedule_query', 'progress_query', 'warning', 'blocked');

-- AI risk levels
CREATE TYPE ai_risk_level AS ENUM ('low', 'medium', 'high', 'critical');

-- ============================================================
-- 1. TENANTS / ORGANIZATIONS (Multi-tenancy root)
-- ============================================================

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    -- Organization details
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    postal_code VARCHAR(20),
    -- Branding
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#2563EB',
    -- Subscription
    subscription_tier subscription_tier DEFAULT 'free',
    subscription_status subscription_status DEFAULT 'trial',
    trial_ends_at TIMESTAMPTZ,
    subscription_starts_at TIMESTAMPTZ,
    subscription_ends_at TIMESTAMPTZ,
    -- Limits based on tier
    max_patients INT DEFAULT 10,
    max_staff INT DEFAULT 2,
    max_storage_mb INT DEFAULT 100,
    -- Settings
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    default_language VARCHAR(10) DEFAULT 'en',
    settings JSONB DEFAULT '{}',
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    -- Billing
    billing_email VARCHAR(255),
    tax_id VARCHAR(50),
    billing_address TEXT
);

-- Index for quick slug lookups
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_subscription ON tenants(subscription_tier, subscription_status);

-- ============================================================
-- 2. USERS (Authentication root - linked to Supabase Auth)
-- ============================================================

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    -- Basic info
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(50),
    avatar_url TEXT,
    -- Role and status
    role user_role DEFAULT 'patient',
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    is_phone_verified BOOLEAN DEFAULT false,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    -- Settings
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    language VARCHAR(10) DEFAULT 'en',
    notification_preferences JSONB DEFAULT '{"push": true, "email": true, "sms": false}',
    
    CONSTRAINT unique_user_email_per_tenant UNIQUE (tenant_id, email)
);

-- Indexes
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- 3. PATIENT PROFILES
-- ============================================================

CREATE TABLE patient_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    -- Profile info
    display_name VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    -- Emergency contact
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    emergency_contact_relation VARCHAR(50),
    -- Recovery info
    recovery_start_date DATE,
    recovery_type recovery_type,
    recovery_description TEXT,
    expected_recovery_days INT,
    -- Doctor assignment
    assigned_doctor_id UUID REFERENCES users(id),
    -- Settings
    reminder_enabled BOOLEAN DEFAULT true,
    daily_checkin_time TIME DEFAULT '09:00',
    -- Metadata
    is_onboarding_complete BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_patient_profile UNIQUE (user_id)
);

-- Indexes
CREATE INDEX idx_patient_profiles_tenant ON patient_profiles(tenant_id);
CREATE INDEX idx_patient_profiles_user ON patient_profiles(user_id);
CREATE INDEX idx_patient_profiles_doctor ON patient_profiles(assigned_doctor_id);

-- ============================================================
-- 4. CONSENT RECORDS (Legal traceability)
-- ============================================================

CREATE TABLE consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    -- Consent details
    consent_type consent_type NOT NULL,
    consent_version VARCHAR(20) NOT NULL DEFAULT '1.0',
    consent_text TEXT,
    -- Status
    is_granted BOOLEAN NOT NULL,
    granted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    -- Audit
    ip_address INET,
    user_agent TEXT,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_consent_per_user_type UNIQUE (user_id, consent_type, consent_version)
);

-- Indexes
CREATE INDEX idx_consent_records_user ON consent_records(user_id);
CREATE INDEX idx_consent_records_tenant ON consent_records(tenant_id);
CREATE INDEX idx_consent_records_type ON consent_records(consent_type);

-- ============================================================
-- 5. RECOVERY PROFILES (Non-medical recovery info)
-- ============================================================

CREATE TABLE recovery_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    -- Recovery details
    title VARCHAR(255),
    notes TEXT, -- Doctor instructions (text only, encrypted in app)
    expected_duration_days INT,
    actual_duration_days INT,
    -- Progress tracking
    current_day INT DEFAULT 0,
    overall_progress_percent INT DEFAULT 0,
    current_phase VARCHAR(100), -- e.g., "Week 1-2: Initial Recovery"
    -- Status
    is_active BOOLEAN DEFAULT true,
    started_at DATE,
    completed_at DATE,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_recovery_profiles_patient ON recovery_profiles(patient_id);
CREATE INDEX idx_recovery_profiles_tenant ON recovery_profiles(tenant_id);
CREATE INDEX idx_recovery_profiles_active ON recovery_profiles(is_active);

-- ============================================================
-- 6. TASK SCHEDULES (Medicine, Exercise, Meal templates)
-- ============================================================

CREATE TABLE task_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    recovery_id UUID REFERENCES recovery_profiles(id) ON DELETE SET NULL,
    -- Task info
    task_type task_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    -- Scheduling
    frequency task_frequency DEFAULT 'daily',
    time_slots JSONB DEFAULT '[]', -- Array of HH:MM times
    days_of_week JSONB DEFAULT '[0,1,2,3,4,5,6]', -- 0=Sunday
    -- Duration
    start_date DATE,
    end_date DATE,
    duration_minutes INT, -- For exercises
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_task_schedules_patient ON task_schedules(patient_id);
CREATE INDEX idx_task_schedules_tenant ON task_schedules(tenant_id);
CREATE INDEX idx_task_schedules_type ON task_schedules(task_type);
CREATE INDEX idx_task_schedules_active ON task_schedules(is_active);

-- ============================================================
-- 7. TASK COMPLETIONS (Daily task log)
-- ============================================================

CREATE TABLE task_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES task_schedules(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    -- Completion info
    scheduled_date DATE NOT NULL,
    scheduled_time TIME,
    status task_status DEFAULT 'pending',
    -- Completion details
    completed_at TIMESTAMPTZ,
    skip_reason VARCHAR(255),
    notes TEXT,
    -- For exercises
    actual_duration_minutes INT,
    pain_level_during INT CHECK (pain_level_during >= 1 AND pain_level_during <= 10),
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_task_completion UNIQUE (task_id, scheduled_date, scheduled_time)
);

-- Indexes
CREATE INDEX idx_task_completions_task ON task_completions(task_id);
CREATE INDEX idx_task_completions_patient ON task_completions(patient_id);
CREATE INDEX idx_task_completions_tenant ON task_completions(tenant_id);
CREATE INDEX idx_task_completions_date ON task_completions(scheduled_date);
CREATE INDEX idx_task_completions_status ON task_completions(status);

-- ============================================================
-- 8. DAILY RECOVERY LOGS (Daily check-in)
-- ============================================================

CREATE TABLE daily_recovery_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    recovery_id UUID REFERENCES recovery_profiles(id) ON DELETE SET NULL,
    -- Log date
    log_date DATE NOT NULL,
    day_number INT, -- Day X of recovery
    -- Health metrics
    mood mood_type,
    pain_score INT CHECK (pain_score >= 1 AND pain_score <= 10),
    swelling swelling_status,
    sleep_quality INT CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
    energy_level INT CHECK (energy_level >= 1 AND energy_level <= 5),
    -- Progress
    medicine_adherence_percent INT DEFAULT 0,
    exercise_completion_percent INT DEFAULT 0,
    -- Computed
    recovery_score INT, -- Computed daily score
    trend recovery_trend,
    -- Notes
    notes TEXT,
    symptoms JSONB DEFAULT '[]', -- Array of symptom strings
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_daily_log UNIQUE (patient_id, log_date)
);

-- Indexes
CREATE INDEX idx_daily_recovery_logs_patient ON daily_recovery_logs(patient_id);
CREATE INDEX idx_daily_recovery_logs_tenant ON daily_recovery_logs(tenant_id);
CREATE INDEX idx_daily_recovery_logs_date ON daily_recovery_logs(log_date);
CREATE INDEX idx_daily_recovery_logs_recovery ON daily_recovery_logs(recovery_id);

-- ============================================================
-- 9. VIEWER ACCESS (Family/Friend sharing)
-- ============================================================

CREATE TABLE viewer_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    -- Viewer info (can be existing user or invited by email)
    viewer_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    viewer_email VARCHAR(255) NOT NULL,
    viewer_name VARCHAR(255),
    relationship VARCHAR(100), -- e.g., "Mother", "Spouse", "Friend"
    -- Access control
    access_level access_level DEFAULT 'summary_only',
    update_frequency update_frequency DEFAULT 'daily',
    -- Permissions (granular)
    can_view_progress BOOLEAN DEFAULT true,
    can_view_medications BOOLEAN DEFAULT false,
    can_view_exercises BOOLEAN DEFAULT false,
    can_view_mood BOOLEAN DEFAULT true,
    can_view_pain_score BOOLEAN DEFAULT false,
    can_receive_alerts BOOLEAN DEFAULT true,
    -- Invitation
    invite_token VARCHAR(255),
    invite_sent_at TIMESTAMPTZ,
    invite_expires_at TIMESTAMPTZ,
    -- Status
    is_accepted BOOLEAN DEFAULT false,
    accepted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_viewer_per_patient UNIQUE (patient_id, viewer_email)
);

-- Indexes
CREATE INDEX idx_viewer_access_patient ON viewer_access(patient_id);
CREATE INDEX idx_viewer_access_tenant ON viewer_access(tenant_id);
CREATE INDEX idx_viewer_access_viewer ON viewer_access(viewer_user_id);
CREATE INDEX idx_viewer_access_email ON viewer_access(viewer_email);
CREATE INDEX idx_viewer_access_active ON viewer_access(is_active);

-- ============================================================
-- 10. NOTIFICATION LOGS
-- ============================================================

CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    -- Notification info
    notification_type notification_type NOT NULL,
    channel notification_channel NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    -- Related entities
    related_task_id UUID REFERENCES task_schedules(id) ON DELETE SET NULL,
    related_patient_id UUID REFERENCES patient_profiles(id) ON DELETE SET NULL,
    -- Delivery
    status notification_status DEFAULT 'pending',
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    failed_reason TEXT,
    -- Metadata
    metadata JSONB DEFAULT '{}',
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notification_logs_user ON notification_logs(user_id);
CREATE INDEX idx_notification_logs_tenant ON notification_logs(tenant_id);
CREATE INDEX idx_notification_logs_status ON notification_logs(status);
CREATE INDEX idx_notification_logs_type ON notification_logs(notification_type);
CREATE INDEX idx_notification_logs_scheduled ON notification_logs(scheduled_for);

-- ============================================================
-- 11. AI INTERACTION LOGS (Isolated from health data)
-- ============================================================

CREATE TABLE ai_interaction_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    -- Session tracking
    session_id UUID DEFAULT uuid_generate_v4(),
    -- Classification
    intent_type ai_intent_type,
    risk_level ai_risk_level DEFAULT 'low',
    -- Messages (sanitized)
    user_message TEXT NOT NULL,
    ai_response TEXT,
    -- Safety
    was_blocked BOOLEAN DEFAULT false,
    blocked_reason VARCHAR(255),
    safety_warning_shown BOOLEAN DEFAULT false,
    -- AI Provider info
    ai_provider VARCHAR(50), -- 'gemini', 'groq', 'sarvam', 'openai', etc.
    model_used VARCHAR(100),
    tokens_used INT,
    response_time_ms INT,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ai_logs_patient ON ai_interaction_logs(patient_id);
CREATE INDEX idx_ai_logs_tenant ON ai_interaction_logs(tenant_id);
CREATE INDEX idx_ai_logs_session ON ai_interaction_logs(session_id);
CREATE INDEX idx_ai_logs_intent ON ai_interaction_logs(intent_type);
CREATE INDEX idx_ai_logs_risk ON ai_interaction_logs(risk_level);
CREATE INDEX idx_ai_logs_blocked ON ai_interaction_logs(was_blocked);

-- ============================================================
-- 12. MEDICATIONS (Detailed medication tracking)
-- ============================================================

CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    -- Medication info (generic, no brand recommendations)
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    dosage VARCHAR(100),
    dosage_unit VARCHAR(50), -- mg, ml, tablets, etc.
    form VARCHAR(50), -- tablet, capsule, liquid, injection
    -- Schedule
    frequency task_frequency DEFAULT 'daily',
    times JSONB DEFAULT '[]', -- Array of HH:MM
    with_food BOOLEAN DEFAULT false,
    -- Duration
    start_date DATE,
    end_date DATE,
    -- Instructions
    instructions TEXT,
    side_effects TEXT,
    warnings TEXT,
    -- Prescription
    prescribed_by VARCHAR(255),
    prescription_date DATE,
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_prn BOOLEAN DEFAULT false, -- As needed
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_medications_patient ON medications(patient_id);
CREATE INDEX idx_medications_tenant ON medications(tenant_id);
CREATE INDEX idx_medications_active ON medications(is_active);

-- ============================================================
-- 13. MEDICATION LOGS
-- ============================================================

CREATE TABLE medication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    -- Schedule
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    -- Status
    status task_status DEFAULT 'pending',
    taken_at TIMESTAMPTZ,
    skip_reason VARCHAR(255),
    -- Side effects
    had_side_effects BOOLEAN DEFAULT false,
    side_effect_notes TEXT,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_medication_log UNIQUE (medication_id, scheduled_date, scheduled_time)
);

-- Indexes
CREATE INDEX idx_medication_logs_medication ON medication_logs(medication_id);
CREATE INDEX idx_medication_logs_patient ON medication_logs(patient_id);
CREATE INDEX idx_medication_logs_tenant ON medication_logs(tenant_id);
CREATE INDEX idx_medication_logs_date ON medication_logs(scheduled_date);
CREATE INDEX idx_medication_logs_status ON medication_logs(status);

-- ============================================================
-- 14. EXERCISES
-- ============================================================

CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    -- Exercise info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    -- Media
    video_url TEXT,
    image_url TEXT,
    -- Schedule
    frequency task_frequency DEFAULT 'daily',
    duration_minutes INT DEFAULT 10,
    repetitions INT,
    sets INT,
    days_of_week JSONB DEFAULT '[0,1,2,3,4,5,6]',
    preferred_time TIME,
    -- Duration
    start_date DATE,
    end_date DATE,
    -- Safety
    max_pain_threshold INT DEFAULT 5, -- Stop if pain exceeds
    precautions TEXT,
    contraindications TEXT,
    -- Status
    is_active BOOLEAN DEFAULT true,
    difficulty_level INT CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_exercises_patient ON exercises(patient_id);
CREATE INDEX idx_exercises_tenant ON exercises(tenant_id);
CREATE INDEX idx_exercises_active ON exercises(is_active);

-- ============================================================
-- 15. EXERCISE LOGS
-- ============================================================

CREATE TABLE exercise_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    -- Schedule
    scheduled_date DATE NOT NULL,
    -- Status
    status task_status DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    skip_reason VARCHAR(255),
    -- Progress
    actual_duration_minutes INT,
    actual_repetitions INT,
    actual_sets INT,
    -- Pain tracking
    pain_before INT CHECK (pain_before >= 1 AND pain_before <= 10),
    pain_during INT CHECK (pain_during >= 1 AND pain_during <= 10),
    pain_after INT CHECK (pain_after >= 1 AND pain_after <= 10),
    -- Notes
    notes TEXT,
    difficulty_felt INT CHECK (difficulty_felt >= 1 AND difficulty_felt <= 5),
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_exercise_log UNIQUE (exercise_id, scheduled_date)
);

-- Indexes
CREATE INDEX idx_exercise_logs_exercise ON exercise_logs(exercise_id);
CREATE INDEX idx_exercise_logs_patient ON exercise_logs(patient_id);
CREATE INDEX idx_exercise_logs_tenant ON exercise_logs(tenant_id);
CREATE INDEX idx_exercise_logs_date ON exercise_logs(scheduled_date);
CREATE INDEX idx_exercise_logs_status ON exercise_logs(status);

-- ============================================================
-- 16. MILESTONES
-- ============================================================

CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    recovery_id UUID REFERENCES recovery_profiles(id) ON DELETE SET NULL,
    -- Milestone info
    title VARCHAR(255) NOT NULL,
    description TEXT,
    milestone_type VARCHAR(50), -- 'recovery', 'adherence', 'streak', 'custom'
    -- Achievement
    is_achieved BOOLEAN DEFAULT false,
    achieved_at TIMESTAMPTZ,
    target_date DATE,
    -- Progress
    target_value INT,
    current_value INT,
    -- Badge/Reward
    badge_icon VARCHAR(100),
    points_earned INT DEFAULT 0,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_milestones_patient ON milestones(patient_id);
CREATE INDEX idx_milestones_tenant ON milestones(tenant_id);
CREATE INDEX idx_milestones_achieved ON milestones(is_achieved);

-- ============================================================
-- 17. AUDIT LOGS (For compliance)
-- ============================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    -- Action info
    action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'view', 'export'
    entity_type VARCHAR(100) NOT NULL, -- Table name
    entity_id UUID,
    -- Changes
    old_values JSONB,
    new_values JSONB,
    -- Context
    ip_address INET,
    user_agent TEXT,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ============================================================
-- 18. API KEYS (For external integrations)
-- ============================================================

CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    -- Key info
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL, -- Store hashed key
    key_prefix VARCHAR(10) NOT NULL, -- First few chars for identification
    -- Permissions
    scopes JSONB DEFAULT '[]', -- Array of allowed scopes
    -- Usage limits
    rate_limit_per_minute INT DEFAULT 60,
    rate_limit_per_day INT DEFAULT 10000,
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_api_keys_tenant ON api_keys(tenant_id);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_keys_active ON api_keys(is_active);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to compute recovery score
CREATE OR REPLACE FUNCTION compute_recovery_score(
    p_medicine_adherence INT,
    p_exercise_completion INT,
    p_pain_score INT,
    p_mood mood_type,
    p_swelling swelling_status
)
RETURNS INT AS $$
DECLARE
    v_score INT := 0;
    v_mood_score INT;
    v_swelling_score INT;
BEGIN
    -- Medicine adherence (max 30 points)
    v_score := v_score + (p_medicine_adherence * 30 / 100);
    
    -- Exercise completion (max 25 points)
    v_score := v_score + (p_exercise_completion * 25 / 100);
    
    -- Pain score (max 25 points, inverse)
    v_score := v_score + ((10 - COALESCE(p_pain_score, 5)) * 25 / 10);
    
    -- Mood (max 10 points)
    v_mood_score := CASE p_mood
        WHEN 'great' THEN 10
        WHEN 'good' THEN 8
        WHEN 'ok' THEN 6
        WHEN 'low' THEN 4
        WHEN 'struggling' THEN 2
        ELSE 5
    END;
    v_score := v_score + v_mood_score;
    
    -- Swelling (max 10 points)
    v_swelling_score := CASE p_swelling
        WHEN 'none' THEN 10
        WHEN 'mild' THEN 7
        WHEN 'moderate' THEN 4
        WHEN 'severe' THEN 1
        ELSE 5
    END;
    v_score := v_score + v_swelling_score;
    
    RETURN LEAST(100, GREATEST(0, v_score));
END;
$$ LANGUAGE plpgsql;

-- Function to determine recovery trend
CREATE OR REPLACE FUNCTION determine_recovery_trend(
    p_patient_id UUID,
    p_current_score INT
)
RETURNS recovery_trend AS $$
DECLARE
    v_avg_score NUMERIC;
    v_prev_scores INT[];
BEGIN
    -- Get last 7 days scores
    SELECT ARRAY_AGG(recovery_score ORDER BY log_date DESC)
    INTO v_prev_scores
    FROM daily_recovery_logs
    WHERE patient_id = p_patient_id
      AND log_date < CURRENT_DATE
      AND recovery_score IS NOT NULL
    LIMIT 7;
    
    IF v_prev_scores IS NULL OR array_length(v_prev_scores, 1) < 3 THEN
        RETURN 'stable';
    END IF;
    
    v_avg_score := (SELECT AVG(s) FROM unnest(v_prev_scores) s);
    
    IF p_current_score >= v_avg_score + 5 THEN
        RETURN 'improving';
    ELSIF p_current_score <= v_avg_score - 10 THEN
        RETURN 'warning';
    ELSIF p_current_score <= v_avg_score - 20 THEN
        RETURN 'critical';
    ELSE
        RETURN 'stable';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at for all tables
CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_profiles_updated_at
    BEFORE UPDATE ON patient_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consent_records_updated_at
    BEFORE UPDATE ON consent_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recovery_profiles_updated_at
    BEFORE UPDATE ON recovery_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_schedules_updated_at
    BEFORE UPDATE ON task_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_completions_updated_at
    BEFORE UPDATE ON task_completions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_recovery_logs_updated_at
    BEFORE UPDATE ON daily_recovery_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_viewer_access_updated_at
    BEFORE UPDATE ON viewer_access
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_logs_updated_at
    BEFORE UPDATE ON notification_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_updated_at
    BEFORE UPDATE ON medications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medication_logs_updated_at
    BEFORE UPDATE ON medication_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at
    BEFORE UPDATE ON exercises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_logs_updated_at
    BEFORE UPDATE ON exercise_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at
    BEFORE UPDATE ON milestones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_recovery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewer_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's tenant_id
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT tenant_id 
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_tenant_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role IN ('clinic_admin', 'super_admin')
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RLS POLICIES FOR TENANTS
-- ============================================================

-- Users can only see their own tenant
CREATE POLICY tenant_isolation_select ON tenants
    FOR SELECT
    USING (id = get_current_tenant_id());

-- Only super_admin can create tenants (done via service role, which bypasses RLS)
-- This policy blocks all direct user inserts; service role operations are unaffected by RLS
CREATE POLICY tenant_insert ON tenants
    FOR INSERT
    WITH CHECK (false);

-- Tenant admins can update their tenant
CREATE POLICY tenant_update ON tenants
    FOR UPDATE
    USING (id = get_current_tenant_id() AND is_tenant_admin());

-- ============================================================
-- RLS POLICIES FOR USERS
-- ============================================================

-- Users can see other users in same tenant
CREATE POLICY users_tenant_isolation ON users
    FOR SELECT
    USING (tenant_id = get_current_tenant_id());

-- Users can update their own profile
CREATE POLICY users_self_update ON users
    FOR UPDATE
    USING (id = auth.uid());

-- ============================================================
-- RLS POLICIES FOR PATIENT PROFILES
-- ============================================================

-- Patients see own profile, doctors/admins see all in tenant
CREATE POLICY patient_profiles_select ON patient_profiles
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id() AND (
            user_id = auth.uid() OR
            is_tenant_admin() OR
            assigned_doctor_id = auth.uid()
        )
    );

-- Patients can insert own profile
CREATE POLICY patient_profiles_insert ON patient_profiles
    FOR INSERT
    WITH CHECK (user_id = auth.uid() AND tenant_id = get_current_tenant_id());

-- Patients can update own profile
CREATE POLICY patient_profiles_update ON patient_profiles
    FOR UPDATE
    USING (user_id = auth.uid());

-- ============================================================
-- RLS POLICIES FOR HEALTH DATA (Strict patient ownership)
-- ============================================================

-- Recovery profiles
CREATE POLICY recovery_profiles_select ON recovery_profiles
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id() AND
        patient_id IN (
            SELECT id FROM patient_profiles 
            WHERE user_id = auth.uid() OR assigned_doctor_id = auth.uid()
        )
    );

CREATE POLICY recovery_profiles_insert ON recovery_profiles
    FOR INSERT
    WITH CHECK (
        tenant_id = get_current_tenant_id() AND
        patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY recovery_profiles_update ON recovery_profiles
    FOR UPDATE
    USING (
        patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
    );

-- Task schedules
CREATE POLICY task_schedules_select ON task_schedules
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id() AND
        patient_id IN (
            SELECT id FROM patient_profiles 
            WHERE user_id = auth.uid() OR assigned_doctor_id = auth.uid()
        )
    );

CREATE POLICY task_schedules_insert ON task_schedules
    FOR INSERT
    WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY task_schedules_update ON task_schedules
    FOR UPDATE
    USING (
        patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
    );

-- Task completions
CREATE POLICY task_completions_select ON task_completions
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id() AND
        patient_id IN (
            SELECT id FROM patient_profiles 
            WHERE user_id = auth.uid() OR assigned_doctor_id = auth.uid()
        )
    );

CREATE POLICY task_completions_insert ON task_completions
    FOR INSERT
    WITH CHECK (
        tenant_id = get_current_tenant_id() AND
        patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY task_completions_update ON task_completions
    FOR UPDATE
    USING (
        patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
    );

-- Daily recovery logs
CREATE POLICY daily_logs_select ON daily_recovery_logs
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id() AND
        patient_id IN (
            SELECT id FROM patient_profiles 
            WHERE user_id = auth.uid() OR assigned_doctor_id = auth.uid()
        )
    );

CREATE POLICY daily_logs_insert ON daily_recovery_logs
    FOR INSERT
    WITH CHECK (
        tenant_id = get_current_tenant_id() AND
        patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY daily_logs_update ON daily_recovery_logs
    FOR UPDATE
    USING (
        patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
    );

-- Medications
CREATE POLICY medications_select ON medications
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id() AND
        patient_id IN (
            SELECT id FROM patient_profiles 
            WHERE user_id = auth.uid() OR assigned_doctor_id = auth.uid()
        )
    );

CREATE POLICY medications_insert ON medications
    FOR INSERT
    WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY medications_update ON medications
    FOR UPDATE
    USING (
        patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
    );

-- Medication logs
CREATE POLICY medication_logs_select ON medication_logs
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id() AND
        patient_id IN (
            SELECT id FROM patient_profiles 
            WHERE user_id = auth.uid() OR assigned_doctor_id = auth.uid()
        )
    );

CREATE POLICY medication_logs_insert ON medication_logs
    FOR INSERT
    WITH CHECK (
        tenant_id = get_current_tenant_id() AND
        patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY medication_logs_update ON medication_logs
    FOR UPDATE
    USING (
        patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
    );

-- Exercises
CREATE POLICY exercises_select ON exercises
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id() AND
        patient_id IN (
            SELECT id FROM patient_profiles 
            WHERE user_id = auth.uid() OR assigned_doctor_id = auth.uid()
        )
    );

CREATE POLICY exercises_insert ON exercises
    FOR INSERT
    WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY exercises_update ON exercises
    FOR UPDATE
    USING (
        patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
    );

-- Exercise logs
CREATE POLICY exercise_logs_select ON exercise_logs
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id() AND
        patient_id IN (
            SELECT id FROM patient_profiles 
            WHERE user_id = auth.uid() OR assigned_doctor_id = auth.uid()
        )
    );

CREATE POLICY exercise_logs_insert ON exercise_logs
    FOR INSERT
    WITH CHECK (
        tenant_id = get_current_tenant_id() AND
        patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY exercise_logs_update ON exercise_logs
    FOR UPDATE
    USING (
        patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
    );

-- ============================================================
-- RLS POLICIES FOR CONSENT (Critical for DPDP compliance)
-- ============================================================

CREATE POLICY consent_select ON consent_records
    FOR SELECT
    USING (user_id = auth.uid() OR is_tenant_admin());

CREATE POLICY consent_insert ON consent_records
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY consent_update ON consent_records
    FOR UPDATE
    USING (user_id = auth.uid());

-- ============================================================
-- RLS POLICIES FOR VIEWER ACCESS
-- ============================================================

-- Patients manage their viewers
CREATE POLICY viewer_access_patient ON viewer_access
    FOR ALL
    USING (
        tenant_id = get_current_tenant_id() AND
        patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
    );

-- Viewers can see their access
CREATE POLICY viewer_access_viewer ON viewer_access
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id() AND
        (viewer_user_id = auth.uid() OR viewer_email = (SELECT email FROM users WHERE id = auth.uid()))
    );

-- ============================================================
-- RLS POLICIES FOR NOTIFICATIONS
-- ============================================================

CREATE POLICY notifications_select ON notification_logs
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id() AND
        user_id = auth.uid()
    );

CREATE POLICY notifications_insert ON notification_logs
    FOR INSERT
    WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY notifications_update ON notification_logs
    FOR UPDATE
    USING (user_id = auth.uid());

-- ============================================================
-- RLS POLICIES FOR AI LOGS
-- ============================================================

CREATE POLICY ai_logs_select ON ai_interaction_logs
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id() AND
        patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY ai_logs_insert ON ai_interaction_logs
    FOR INSERT
    WITH CHECK (
        tenant_id = get_current_tenant_id() AND
        patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
    );

-- ============================================================
-- RLS POLICIES FOR MILESTONES
-- ============================================================

CREATE POLICY milestones_select ON milestones
    FOR SELECT
    USING (
        tenant_id = get_current_tenant_id() AND
        patient_id IN (
            SELECT id FROM patient_profiles 
            WHERE user_id = auth.uid() OR assigned_doctor_id = auth.uid()
        )
    );

CREATE POLICY milestones_insert ON milestones
    FOR INSERT
    WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY milestones_update ON milestones
    FOR UPDATE
    USING (
        patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
    );

-- ============================================================
-- RLS POLICIES FOR AUDIT LOGS (Admin only)
-- ============================================================

CREATE POLICY audit_logs_select ON audit_logs
    FOR SELECT
    USING (tenant_id = get_current_tenant_id() AND is_tenant_admin());

CREATE POLICY audit_logs_insert ON audit_logs
    FOR INSERT
    WITH CHECK (tenant_id = get_current_tenant_id());

-- ============================================================
-- RLS POLICIES FOR API KEYS (Admin only)
-- ============================================================

CREATE POLICY api_keys_select ON api_keys
    FOR SELECT
    USING (tenant_id = get_current_tenant_id() AND is_tenant_admin());

CREATE POLICY api_keys_insert ON api_keys
    FOR INSERT
    WITH CHECK (tenant_id = get_current_tenant_id() AND is_tenant_admin());

CREATE POLICY api_keys_update ON api_keys
    FOR UPDATE
    USING (tenant_id = get_current_tenant_id() AND is_tenant_admin());

CREATE POLICY api_keys_delete ON api_keys
    FOR DELETE
    USING (tenant_id = get_current_tenant_id() AND is_tenant_admin());

-- ============================================================
-- DEFAULT TENANT SETUP
-- ============================================================

-- Create a default tenant for initial setup
-- This should be run after schema creation
-- INSERT INTO tenants (name, slug, email, subscription_tier, subscription_status, trial_ends_at)
-- VALUES ('Default Organization', 'default', 'admin@qr-health.app', 'free', 'trial', NOW() + INTERVAL '30 days');

-- ============================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================

-- View: Today's tasks for a patient
CREATE OR REPLACE VIEW v_today_tasks AS
SELECT 
    ts.id as task_id,
    ts.patient_id,
    ts.tenant_id,
    ts.task_type,
    ts.title,
    ts.description,
    ts.time_slots,
    tc.id as completion_id,
    tc.status,
    tc.completed_at
FROM task_schedules ts
LEFT JOIN task_completions tc ON ts.id = tc.task_id AND tc.scheduled_date = CURRENT_DATE
WHERE ts.is_active = true
  AND (ts.start_date IS NULL OR ts.start_date <= CURRENT_DATE)
  AND (ts.end_date IS NULL OR ts.end_date >= CURRENT_DATE);

-- View: Patient dashboard summary
CREATE OR REPLACE VIEW v_patient_dashboard AS
SELECT 
    pp.id as patient_id,
    pp.user_id,
    pp.tenant_id,
    pp.display_name,
    pp.recovery_start_date,
    CURRENT_DATE - pp.recovery_start_date as days_since_start,
    drl.mood,
    drl.pain_score,
    drl.recovery_score,
    drl.trend,
    drl.medicine_adherence_percent,
    drl.exercise_completion_percent
FROM patient_profiles pp
LEFT JOIN daily_recovery_logs drl ON pp.id = drl.patient_id AND drl.log_date = CURRENT_DATE;

-- View: Family viewer summary (restricted data)
CREATE OR REPLACE VIEW v_family_summary AS
SELECT 
    va.viewer_user_id,
    va.viewer_email,
    pp.display_name as patient_name,
    CURRENT_DATE - pp.recovery_start_date as days_since_start,
    CASE WHEN va.can_view_mood THEN drl.mood ELSE NULL END as mood,
    CASE WHEN va.can_view_progress THEN drl.recovery_score ELSE NULL END as recovery_score,
    CASE WHEN va.can_view_progress THEN drl.medicine_adherence_percent ELSE NULL END as medicine_adherence,
    CASE WHEN va.can_view_progress THEN drl.exercise_completion_percent ELSE NULL END as exercise_completion
FROM viewer_access va
JOIN patient_profiles pp ON va.patient_id = pp.id
LEFT JOIN daily_recovery_logs drl ON pp.id = drl.patient_id AND drl.log_date = CURRENT_DATE
WHERE va.is_active = true AND va.is_accepted = true;

-- ============================================================
-- SEED DATA HELPERS
-- ============================================================

-- Function to create initial tenant and admin user
CREATE OR REPLACE FUNCTION create_tenant_with_admin(
    p_tenant_name VARCHAR(255),
    p_tenant_slug VARCHAR(100),
    p_admin_email VARCHAR(255),
    p_admin_user_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_tenant_id UUID;
BEGIN
    -- Create tenant
    INSERT INTO tenants (name, slug, email, subscription_tier, subscription_status, trial_ends_at)
    VALUES (p_tenant_name, p_tenant_slug, p_admin_email, 'free', 'trial', NOW() + INTERVAL '30 days')
    RETURNING id INTO v_tenant_id;
    
    -- Create admin user
    INSERT INTO users (id, tenant_id, email, role, is_active, is_email_verified)
    VALUES (p_admin_user_id, v_tenant_id, p_admin_email, 'clinic_admin', true, true);
    
    RETURN v_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to onboard a new patient
CREATE OR REPLACE FUNCTION onboard_patient(
    p_user_id UUID,
    p_tenant_id UUID,
    p_email VARCHAR(255),
    p_name VARCHAR(255),
    p_recovery_type recovery_type,
    p_recovery_start_date DATE
)
RETURNS UUID AS $$
DECLARE
    v_patient_id UUID;
BEGIN
    -- Create user if not exists
    INSERT INTO users (id, tenant_id, email, name, role)
    VALUES (p_user_id, p_tenant_id, p_email, p_name, 'patient')
    ON CONFLICT (id) DO NOTHING;
    
    -- Create patient profile
    INSERT INTO patient_profiles (user_id, tenant_id, display_name, recovery_start_date, recovery_type)
    VALUES (p_user_id, p_tenant_id, p_name, p_recovery_start_date, p_recovery_type)
    RETURNING id INTO v_patient_id;
    
    -- Create initial consent record for data processing
    INSERT INTO consent_records (user_id, tenant_id, consent_type, is_granted, granted_at)
    VALUES (p_user_id, p_tenant_id, 'data_processing', true, NOW());
    
    RETURN v_patient_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================

COMMENT ON TABLE tenants IS 'Organizations/clinics using the QR-Health platform';
COMMENT ON TABLE users IS 'All users linked to Supabase Auth, with tenant association';
COMMENT ON TABLE patient_profiles IS 'Extended patient information beyond auth';
COMMENT ON TABLE consent_records IS 'DPDP-compliant consent tracking';
COMMENT ON TABLE recovery_profiles IS 'Individual recovery journeys';
COMMENT ON TABLE task_schedules IS 'Medicine, exercise, meal reminder templates';
COMMENT ON TABLE task_completions IS 'Daily completion status for tasks';
COMMENT ON TABLE daily_recovery_logs IS 'Daily check-in data (mood, pain, etc.)';
COMMENT ON TABLE viewer_access IS 'Family/friend access controls';
COMMENT ON TABLE notification_logs IS 'All notification history';
COMMENT ON TABLE ai_interaction_logs IS 'AI chat logs (isolated from health data)';
COMMENT ON TABLE medications IS 'Patient medication list';
COMMENT ON TABLE medication_logs IS 'Medication adherence tracking';
COMMENT ON TABLE exercises IS 'Patient exercise prescriptions';
COMMENT ON TABLE exercise_logs IS 'Exercise completion tracking';
COMMENT ON TABLE milestones IS 'Recovery achievements and badges';
COMMENT ON TABLE audit_logs IS 'Compliance audit trail';
COMMENT ON TABLE api_keys IS 'External API access management';
