// ============================================================
// QR-HEALTH DATABASE TYPES
// Auto-generated from Supabase schema
// ============================================================

// ============================================================
// ENUM TYPES
// ============================================================

export type UserRole = 'patient' | 'family_viewer' | 'doctor' | 'clinic_admin' | 'super_admin';

export type SubscriptionTier = 'free' | 'basic' | 'professional' | 'enterprise';

export type SubscriptionStatus = 'active' | 'trial' | 'past_due' | 'cancelled' | 'suspended';

export type RecoveryType = 'bone_fracture' | 'surgery' | 'injury' | 'physiotherapy' | 'other';

export type TaskType = 'medicine' | 'exercise' | 'meal' | 'hydration' | 'custom';

export type TaskFrequency = 'once' | 'daily' | 'twice_daily' | 'three_times_daily' | 'weekly' | 'custom';

export type TaskStatus = 'pending' | 'done' | 'skipped' | 'missed';

export type MoodType = 'great' | 'good' | 'ok' | 'low' | 'struggling';

export type SwellingStatus = 'none' | 'mild' | 'moderate' | 'severe';

export type RecoveryTrend = 'improving' | 'stable' | 'warning' | 'critical';

export type ConsentType = 'data_storage' | 'data_processing' | 'family_sharing' | 'analytics' | 'notifications' | 'marketing';

export type AccessLevel = 'summary_only' | 'detailed' | 'full';

export type UpdateFrequency = 'realtime' | 'daily' | 'weekly' | 'milestone_only';

export type NotificationType = 'reminder' | 'alert' | 'milestone' | 'warning' | 'daily_summary' | 'weekly_summary';

export type NotificationChannel = 'push' | 'email' | 'sms' | 'whatsapp' | 'in_app';

export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'read';

export type AIIntentType = 'education' | 'emotional_support' | 'schedule_query' | 'progress_query' | 'warning' | 'blocked';

export type AIRiskLevel = 'low' | 'medium' | 'high' | 'critical';

// ============================================================
// TABLE TYPES
// ============================================================

/**
 * Tenant/Organization - Multi-tenancy root
 */
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  postal_code?: string;
  logo_url?: string;
  primary_color: string;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  trial_ends_at?: string;
  subscription_starts_at?: string;
  subscription_ends_at?: string;
  max_patients: number;
  max_staff: number;
  max_storage_mb: number;
  timezone: string;
  default_language: string;
  settings: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  billing_email?: string;
  tax_id?: string;
  billing_address?: string;
}

/**
 * User - Authentication root linked to Supabase Auth
 */
export interface User {
  id: string;
  tenant_id: string;
  email: string;
  name?: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  is_active: boolean;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  deleted_at?: string;
  timezone: string;
  language: string;
  notification_preferences: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
}

/**
 * Patient Profile - Extended patient information
 */
export interface PatientProfile {
  id: string;
  user_id: string;
  tenant_id: string;
  display_name?: string;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  recovery_start_date?: string;
  recovery_type?: RecoveryType;
  recovery_description?: string;
  expected_recovery_days?: number;
  assigned_doctor_id?: string;
  reminder_enabled: boolean;
  daily_checkin_time: string;
  is_onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Consent Record - DPDP-compliant consent tracking
 */
export interface ConsentRecord {
  id: string;
  user_id: string;
  tenant_id: string;
  consent_type: ConsentType;
  consent_version: string;
  consent_text?: string;
  is_granted: boolean;
  granted_at?: string;
  revoked_at?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Recovery Profile - Individual recovery journeys
 */
export interface RecoveryProfile {
  id: string;
  patient_id: string;
  tenant_id: string;
  title?: string;
  notes?: string;
  expected_duration_days?: number;
  actual_duration_days?: number;
  current_day: number;
  overall_progress_percent: number;
  current_phase?: string;
  is_active: boolean;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Task Schedule - Medicine, exercise, meal reminder templates
 */
export interface TaskSchedule {
  id: string;
  patient_id: string;
  tenant_id: string;
  recovery_id?: string;
  task_type: TaskType;
  title: string;
  description?: string;
  instructions?: string;
  frequency: TaskFrequency;
  time_slots: string[]; // Array of HH:MM times
  days_of_week: number[]; // 0=Sunday
  start_date?: string;
  end_date?: string;
  duration_minutes?: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

/**
 * Task Completion - Daily completion status for tasks
 */
export interface TaskCompletion {
  id: string;
  task_id: string;
  patient_id: string;
  tenant_id: string;
  scheduled_date: string;
  scheduled_time?: string;
  status: TaskStatus;
  completed_at?: string;
  skip_reason?: string;
  notes?: string;
  actual_duration_minutes?: number;
  pain_level_during?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Daily Recovery Log - Daily check-in data
 */
export interface DailyRecoveryLog {
  id: string;
  patient_id: string;
  tenant_id: string;
  recovery_id?: string;
  log_date: string;
  day_number?: number;
  mood?: MoodType;
  pain_score?: number;
  swelling?: SwellingStatus;
  sleep_quality?: number;
  energy_level?: number;
  medicine_adherence_percent: number;
  exercise_completion_percent: number;
  recovery_score?: number;
  trend?: RecoveryTrend;
  notes?: string;
  symptoms: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Viewer Access - Family/friend access controls
 */
export interface ViewerAccess {
  id: string;
  patient_id: string;
  tenant_id: string;
  viewer_user_id?: string;
  viewer_email: string;
  viewer_name?: string;
  relationship?: string;
  access_level: AccessLevel;
  update_frequency: UpdateFrequency;
  can_view_progress: boolean;
  can_view_medications: boolean;
  can_view_exercises: boolean;
  can_view_mood: boolean;
  can_view_pain_score: boolean;
  can_receive_alerts: boolean;
  invite_token?: string;
  invite_sent_at?: string;
  invite_expires_at?: string;
  is_accepted: boolean;
  accepted_at?: string;
  revoked_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Notification Log - All notification history
 */
export interface NotificationLog {
  id: string;
  user_id: string;
  tenant_id: string;
  notification_type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message?: string;
  related_task_id?: string;
  related_patient_id?: string;
  status: NotificationStatus;
  scheduled_for?: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  failed_reason?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/**
 * AI Interaction Log - AI chat logs (isolated from health data)
 */
export interface AIInteractionLog {
  id: string;
  patient_id: string;
  tenant_id: string;
  session_id: string;
  intent_type?: AIIntentType;
  risk_level: AIRiskLevel;
  user_message: string;
  ai_response?: string;
  was_blocked: boolean;
  blocked_reason?: string;
  safety_warning_shown: boolean;
  ai_provider?: string;
  model_used?: string;
  tokens_used?: number;
  response_time_ms?: number;
  created_at: string;
}

/**
 * Medication - Patient medication list
 */
export interface Medication {
  id: string;
  patient_id: string;
  tenant_id: string;
  name: string;
  generic_name?: string;
  dosage?: string;
  dosage_unit?: string;
  form?: string;
  frequency: TaskFrequency;
  times: string[];
  with_food: boolean;
  start_date?: string;
  end_date?: string;
  instructions?: string;
  side_effects?: string;
  warnings?: string;
  prescribed_by?: string;
  prescription_date?: string;
  is_active: boolean;
  is_prn: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

/**
 * Medication Log - Medication adherence tracking
 */
export interface MedicationLog {
  id: string;
  medication_id: string;
  patient_id: string;
  tenant_id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: TaskStatus;
  taken_at?: string;
  skip_reason?: string;
  had_side_effects: boolean;
  side_effect_notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Exercise - Patient exercise prescriptions
 */
export interface Exercise {
  id: string;
  patient_id: string;
  tenant_id: string;
  name: string;
  description?: string;
  instructions?: string;
  video_url?: string;
  image_url?: string;
  frequency: TaskFrequency;
  duration_minutes: number;
  repetitions?: number;
  sets?: number;
  days_of_week: number[];
  preferred_time?: string;
  start_date?: string;
  end_date?: string;
  max_pain_threshold: number;
  precautions?: string;
  contraindications?: string;
  is_active: boolean;
  difficulty_level?: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

/**
 * Exercise Log - Exercise completion tracking
 */
export interface ExerciseLog {
  id: string;
  exercise_id: string;
  patient_id: string;
  tenant_id: string;
  scheduled_date: string;
  status: TaskStatus;
  completed_at?: string;
  skip_reason?: string;
  actual_duration_minutes?: number;
  actual_repetitions?: number;
  actual_sets?: number;
  pain_before?: number;
  pain_during?: number;
  pain_after?: number;
  notes?: string;
  difficulty_felt?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Milestone - Recovery achievements and badges
 */
export interface Milestone {
  id: string;
  patient_id: string;
  tenant_id: string;
  recovery_id?: string;
  title: string;
  description?: string;
  milestone_type?: string;
  is_achieved: boolean;
  achieved_at?: string;
  target_date?: string;
  target_value?: number;
  current_value?: number;
  badge_icon?: string;
  points_earned: number;
  created_at: string;
  updated_at: string;
}

/**
 * Audit Log - Compliance audit trail
 */
export interface AuditLog {
  id: string;
  tenant_id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

/**
 * API Key - External API access management
 */
export interface ApiKey {
  id: string;
  tenant_id: string;
  name: string;
  key_hash: string;
  key_prefix: string;
  scopes: string[];
  rate_limit_per_minute: number;
  rate_limit_per_day: number;
  is_active: boolean;
  last_used_at?: string;
  expires_at?: string;
  created_at: string;
  created_by?: string;
}

// ============================================================
// VIEW TYPES
// ============================================================

/**
 * Today's Tasks View
 */
export interface TodayTask {
  task_id: string;
  patient_id: string;
  tenant_id: string;
  task_type: TaskType;
  title: string;
  description?: string;
  time_slots: string[];
  completion_id?: string;
  status?: TaskStatus;
  completed_at?: string;
}

/**
 * Patient Dashboard View
 */
export interface PatientDashboard {
  patient_id: string;
  user_id: string;
  tenant_id: string;
  display_name?: string;
  recovery_start_date?: string;
  days_since_start?: number;
  mood?: MoodType;
  pain_score?: number;
  recovery_score?: number;
  trend?: RecoveryTrend;
  medicine_adherence_percent?: number;
  exercise_completion_percent?: number;
}

/**
 * Family Summary View (Restricted data)
 */
export interface FamilySummary {
  viewer_user_id?: string;
  viewer_email: string;
  patient_name?: string;
  days_since_start?: number;
  mood?: MoodType;
  recovery_score?: number;
  medicine_adherence?: number;
  exercise_completion?: number;
}

// ============================================================
// INSERT/UPDATE TYPES (Omit auto-generated fields)
// ============================================================

export type TenantInsert = Omit<Tenant, 'id' | 'created_at' | 'updated_at'>;
export type TenantUpdate = Partial<Omit<Tenant, 'id' | 'created_at'>>;

export type UserInsert = Omit<User, 'created_at' | 'updated_at'>;
export type UserUpdate = Partial<Omit<User, 'id' | 'created_at' | 'tenant_id'>>;

export type PatientProfileInsert = Omit<PatientProfile, 'id' | 'created_at' | 'updated_at'>;
export type PatientProfileUpdate = Partial<Omit<PatientProfile, 'id' | 'created_at' | 'user_id' | 'tenant_id'>>;

export type ConsentRecordInsert = Omit<ConsentRecord, 'id' | 'created_at' | 'updated_at'>;
export type ConsentRecordUpdate = Partial<Omit<ConsentRecord, 'id' | 'created_at' | 'user_id' | 'tenant_id'>>;

export type RecoveryProfileInsert = Omit<RecoveryProfile, 'id' | 'created_at' | 'updated_at'>;
export type RecoveryProfileUpdate = Partial<Omit<RecoveryProfile, 'id' | 'created_at' | 'patient_id' | 'tenant_id'>>;

export type TaskScheduleInsert = Omit<TaskSchedule, 'id' | 'created_at' | 'updated_at'>;
export type TaskScheduleUpdate = Partial<Omit<TaskSchedule, 'id' | 'created_at' | 'patient_id' | 'tenant_id'>>;

export type TaskCompletionInsert = Omit<TaskCompletion, 'id' | 'created_at' | 'updated_at'>;
export type TaskCompletionUpdate = Partial<Omit<TaskCompletion, 'id' | 'created_at' | 'task_id' | 'patient_id' | 'tenant_id'>>;

export type DailyRecoveryLogInsert = Omit<DailyRecoveryLog, 'id' | 'created_at' | 'updated_at'>;
export type DailyRecoveryLogUpdate = Partial<Omit<DailyRecoveryLog, 'id' | 'created_at' | 'patient_id' | 'tenant_id'>>;

export type ViewerAccessInsert = Omit<ViewerAccess, 'id' | 'created_at' | 'updated_at'>;
export type ViewerAccessUpdate = Partial<Omit<ViewerAccess, 'id' | 'created_at' | 'patient_id' | 'tenant_id'>>;

export type NotificationLogInsert = Omit<NotificationLog, 'id' | 'created_at' | 'updated_at'>;
export type NotificationLogUpdate = Partial<Omit<NotificationLog, 'id' | 'created_at' | 'user_id' | 'tenant_id'>>;

export type AIInteractionLogInsert = Omit<AIInteractionLog, 'id' | 'created_at'>;

export type MedicationInsert = Omit<Medication, 'id' | 'created_at' | 'updated_at'>;
export type MedicationUpdate = Partial<Omit<Medication, 'id' | 'created_at' | 'patient_id' | 'tenant_id'>>;

export type MedicationLogInsert = Omit<MedicationLog, 'id' | 'created_at' | 'updated_at'>;
export type MedicationLogUpdate = Partial<Omit<MedicationLog, 'id' | 'created_at' | 'medication_id' | 'patient_id' | 'tenant_id'>>;

export type ExerciseInsert = Omit<Exercise, 'id' | 'created_at' | 'updated_at'>;
export type ExerciseUpdate = Partial<Omit<Exercise, 'id' | 'created_at' | 'patient_id' | 'tenant_id'>>;

export type ExerciseLogInsert = Omit<ExerciseLog, 'id' | 'created_at' | 'updated_at'>;
export type ExerciseLogUpdate = Partial<Omit<ExerciseLog, 'id' | 'created_at' | 'exercise_id' | 'patient_id' | 'tenant_id'>>;

export type MilestoneInsert = Omit<Milestone, 'id' | 'created_at' | 'updated_at'>;
export type MilestoneUpdate = Partial<Omit<Milestone, 'id' | 'created_at' | 'patient_id' | 'tenant_id'>>;

export type AuditLogInsert = Omit<AuditLog, 'id' | 'created_at'>;

export type ApiKeyInsert = Omit<ApiKey, 'id' | 'created_at'>;
export type ApiKeyUpdate = Partial<Omit<ApiKey, 'id' | 'created_at' | 'tenant_id' | 'key_hash' | 'key_prefix'>>;

// ============================================================
// SUPABASE DATABASE TYPE DEFINITION
// ============================================================

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: Tenant;
        Insert: TenantInsert;
        Update: TenantUpdate;
      };
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      patient_profiles: {
        Row: PatientProfile;
        Insert: PatientProfileInsert;
        Update: PatientProfileUpdate;
      };
      consent_records: {
        Row: ConsentRecord;
        Insert: ConsentRecordInsert;
        Update: ConsentRecordUpdate;
      };
      recovery_profiles: {
        Row: RecoveryProfile;
        Insert: RecoveryProfileInsert;
        Update: RecoveryProfileUpdate;
      };
      task_schedules: {
        Row: TaskSchedule;
        Insert: TaskScheduleInsert;
        Update: TaskScheduleUpdate;
      };
      task_completions: {
        Row: TaskCompletion;
        Insert: TaskCompletionInsert;
        Update: TaskCompletionUpdate;
      };
      daily_recovery_logs: {
        Row: DailyRecoveryLog;
        Insert: DailyRecoveryLogInsert;
        Update: DailyRecoveryLogUpdate;
      };
      viewer_access: {
        Row: ViewerAccess;
        Insert: ViewerAccessInsert;
        Update: ViewerAccessUpdate;
      };
      notification_logs: {
        Row: NotificationLog;
        Insert: NotificationLogInsert;
        Update: NotificationLogUpdate;
      };
      ai_interaction_logs: {
        Row: AIInteractionLog;
        Insert: AIInteractionLogInsert;
        Update: never;
      };
      medications: {
        Row: Medication;
        Insert: MedicationInsert;
        Update: MedicationUpdate;
      };
      medication_logs: {
        Row: MedicationLog;
        Insert: MedicationLogInsert;
        Update: MedicationLogUpdate;
      };
      exercises: {
        Row: Exercise;
        Insert: ExerciseInsert;
        Update: ExerciseUpdate;
      };
      exercise_logs: {
        Row: ExerciseLog;
        Insert: ExerciseLogInsert;
        Update: ExerciseLogUpdate;
      };
      milestones: {
        Row: Milestone;
        Insert: MilestoneInsert;
        Update: MilestoneUpdate;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: AuditLogInsert;
        Update: never;
      };
      api_keys: {
        Row: ApiKey;
        Insert: ApiKeyInsert;
        Update: ApiKeyUpdate;
      };
    };
    Views: {
      v_today_tasks: {
        Row: TodayTask;
      };
      v_patient_dashboard: {
        Row: PatientDashboard;
      };
      v_family_summary: {
        Row: FamilySummary;
      };
    };
    Functions: {
      get_current_tenant_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      is_tenant_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      compute_recovery_score: {
        Args: {
          p_medicine_adherence: number;
          p_exercise_completion: number;
          p_pain_score: number;
          p_mood: MoodType;
          p_swelling: SwellingStatus;
        };
        Returns: number;
      };
      determine_recovery_trend: {
        Args: {
          p_patient_id: string;
          p_current_score: number;
        };
        Returns: RecoveryTrend;
      };
      create_tenant_with_admin: {
        Args: {
          p_tenant_name: string;
          p_tenant_slug: string;
          p_admin_email: string;
          p_admin_user_id: string;
        };
        Returns: string;
      };
      onboard_patient: {
        Args: {
          p_user_id: string;
          p_tenant_id: string;
          p_email: string;
          p_name: string;
          p_recovery_type: RecoveryType;
          p_recovery_start_date: string;
        };
        Returns: string;
      };
    };
    Enums: {
      user_role: UserRole;
      subscription_tier: SubscriptionTier;
      subscription_status: SubscriptionStatus;
      recovery_type: RecoveryType;
      task_type: TaskType;
      task_frequency: TaskFrequency;
      task_status: TaskStatus;
      mood_type: MoodType;
      swelling_status: SwellingStatus;
      recovery_trend: RecoveryTrend;
      consent_type: ConsentType;
      access_level: AccessLevel;
      update_frequency: UpdateFrequency;
      notification_type: NotificationType;
      notification_channel: NotificationChannel;
      notification_status: NotificationStatus;
      ai_intent_type: AIIntentType;
      ai_risk_level: AIRiskLevel;
    };
  };
}
