// User roles as per blueprint
export type UserRole = 'patient' | 'family_viewer' | 'doctor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  consentGiven: boolean;
  consentDate?: string;
}

export interface Patient extends User {
  role: 'patient';
  surgeryDate?: string;
  surgeryType?: string;
  recoveryStartDate?: string;
  doctorId?: string;
  familyViewers: string[]; // User IDs of family members
}

export interface FamilyViewer extends User {
  role: 'family_viewer';
  patientId: string;
  permissions: FamilyPermissions;
}

export interface FamilyPermissions {
  canViewProgress: boolean;
  canViewMedications: boolean;
  canViewExercises: boolean;
  canViewMood: boolean;
  notificationFrequency: 'daily' | 'weekly' | 'milestone' | 'none';
}

// Recovery tracking types
export interface RecoveryProgress {
  id: string;
  patientId: string;
  date: string;
  dayCount: number; // Days post-surgery
  medicineAdherence: number; // Percentage 0-100
  exerciseConsistency: number; // Percentage 0-100
  painScore: number; // 1-10
  swellingStatus: 'none' | 'mild' | 'moderate' | 'severe';
  mood: 'great' | 'good' | 'ok' | 'pain' | 'struggling';
  recoveryScore: number; // Computed score
  trend: 'improving' | 'stable' | 'warning';
  notes?: string;
}

// Medication types
export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: MedicationFrequency;
  times: string[]; // Array of times like ["08:00", "20:00"]
  startDate: string;
  endDate?: string;
  instructions?: string;
  isActive: boolean;
}

export type MedicationFrequency = 'once_daily' | 'twice_daily' | 'three_times_daily' | 'four_times_daily' | 'as_needed' | 'weekly';

export interface MedicationLog {
  id: string;
  medicationId: string;
  patientId: string;
  scheduledTime: string;
  takenAt?: string;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  notes?: string;
}

// Exercise types
export interface Exercise {
  id: string;
  patientId: string;
  name: string;
  description: string;
  duration: number; // in minutes
  frequency: ExerciseFrequency;
  scheduledDays: number[]; // 0-6 for Sunday-Saturday
  time?: string;
  videoUrl?: string;
  isActive: boolean;
}

export type ExerciseFrequency = 'daily' | 'alternate_days' | 'weekly' | 'twice_weekly' | 'three_times_weekly';

export interface ExerciseLog {
  id: string;
  exerciseId: string;
  patientId: string;
  scheduledDate: string;
  completedAt?: string;
  status: 'pending' | 'completed' | 'skipped' | 'partial';
  duration?: number;
  painLevel?: number; // 1-10
  notes?: string;
}

// Reminder types
export interface Reminder {
  id: string;
  patientId: string;
  type: ReminderType;
  referenceId?: string; // ID of medication/exercise if applicable
  title: string;
  message: string;
  scheduledTime: string;
  recurring: boolean;
  recurringPattern?: string; // Cron expression or simple pattern
  isActive: boolean;
  lastSent?: string;
  nextScheduled?: string;
}

export type ReminderType = 'medication' | 'exercise' | 'meal' | 'hydration' | 'custom';

// Notification types for family
export interface FamilyNotification {
  id: string;
  patientId: string;
  familyViewerId: string;
  type: FamilyNotificationType;
  title: string;
  message: string;
  sentAt: string;
  readAt?: string;
  channel: 'email' | 'push' | 'whatsapp';
}

export type FamilyNotificationType = 
  | 'daily_summary'
  | 'recovery_completed'
  | 'missed_medication'
  | 'milestone_reached'
  | 'warning'
  | 'weekly_summary';

// AI Assistant types
export interface AIConversation {
  id: string;
  patientId: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  safetyFlag?: AISafetyFlag;
}

export type AISafetyFlag = 
  | 'safe'
  | 'redirect_to_doctor'
  | 'pain_warning'
  | 'blocked_request';

// Dashboard stats
export interface DashboardStats {
  daysSinceSurgery: number;
  todayProgress: {
    medications: { completed: number; total: number };
    exercises: { completed: number; total: number };
    hydration: { completed: number; target: number };
    meals: { completed: number; total: number };
  };
  weeklyProgress: {
    medicineAdherence: number;
    exerciseConsistency: number;
    averagePainScore: number;
  };
  recoveryScore: number;
  recoveryTrend: 'improving' | 'stable' | 'warning';
  nextReminder?: Reminder;
}

// Family Dashboard stats
export interface FamilyDashboardStats {
  patientName: string;
  daysSinceSurgery: number;
  todayCompletion: number; // Percentage
  medicinesTaken: boolean;
  exercisesDone: boolean;
  currentMood: 'great' | 'good' | 'ok' | 'pain' | 'struggling';
  lastUpdated: string;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  achievedAt: string;
  type: 'recovery' | 'adherence' | 'streak' | 'custom';
}

// Consent types
export interface ConsentRecord {
  id: string;
  userId: string;
  type: 'data_processing' | 'family_sharing' | 'notifications' | 'analytics';
  granted: boolean;
  grantedAt?: string;
  revokedAt?: string;
  version: string;
}
