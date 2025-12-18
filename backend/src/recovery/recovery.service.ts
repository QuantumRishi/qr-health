import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../common/supabase';
import {
  DailyRecoveryLog,
  RecoveryProfile,
  PatientProfile,
  MoodType,
  SwellingStatus,
  RecoveryTrend,
} from '../types';

export interface RecoveryProgress {
  id: string;
  patientId: string;
  date: string;
  dayCount: number;
  medicineAdherence: number;
  exerciseConsistency: number;
  painScore: number;
  swellingStatus: 'none' | 'mild' | 'moderate' | 'severe';
  mood: 'great' | 'good' | 'ok' | 'low' | 'struggling';
  recoveryScore: number;
  trend: 'improving' | 'stable' | 'warning' | 'critical';
  notes?: string;
}

@Injectable()
export class RecoveryService {
  private readonly logger = new Logger(RecoveryService.name);

  constructor(private supabase: SupabaseService) {}

  /**
   * Log daily recovery progress to Supabase
   */
  async logProgress(
    userId: string,
    data: Partial<RecoveryProgress>,
  ): Promise<RecoveryProgress> {
    const client = this.supabase.getAdminClient();

    // Get patient profile for the user
    const patientProfile = await this.getPatientProfile(userId);
    if (!patientProfile) {
      throw new Error('Patient profile not found');
    }

    const today = new Date().toISOString().split('T')[0];
    const dayCount = this.calculateDayCount(patientProfile.recovery_start_date);
    const recoveryScore = this.calculateRecoveryScore(data);
    const trend = await this.calculateTrend(patientProfile.id, recoveryScore);

    // Map mood type for compatibility
    const moodMapping: Record<string, MoodType> = {
      great: 'great',
      good: 'good',
      ok: 'ok',
      pain: 'low', // Map 'pain' to 'low'
      low: 'low',
      struggling: 'struggling',
    };
    const mood = moodMapping[data.mood || 'ok'] || 'ok';

    // Upsert daily recovery log (one per day per patient)
    const { data: log, error } = await client
      .from('daily_recovery_logs')
      .upsert(
        {
          patient_id: patientProfile.id,
          tenant_id: patientProfile.tenant_id,
          log_date: today,
          day_number: dayCount,
          mood: mood,
          pain_score: data.painScore ?? 5,
          swelling: (data.swellingStatus || 'mild') as SwellingStatus,
          medicine_adherence_percent: data.medicineAdherence ?? 0,
          exercise_completion_percent: data.exerciseConsistency ?? 0,
          recovery_score: recoveryScore,
          trend: trend,
          notes: data.notes,
          symptoms: [],
        },
        {
          onConflict: 'patient_id,log_date',
        },
      )
      .select()
      .single();

    if (error) {
      this.logger.error('Failed to log recovery progress', error);
      throw new Error(`Failed to log progress: ${error.message}`);
    }

    return this.mapToRecoveryProgress(log as DailyRecoveryLog);
  }

  /**
   * Get all recovery progress for a patient
   */
  async getProgress(userId: string): Promise<RecoveryProgress[]> {
    const client = this.supabase.getAdminClient();

    const patientProfile = await this.getPatientProfile(userId);
    if (!patientProfile) {
      return [];
    }

    const { data: logs, error } = await client
      .from('daily_recovery_logs')
      .select('*')
      .eq('patient_id', patientProfile.id)
      .order('log_date', { ascending: false })
      .limit(30);

    if (error) {
      this.logger.error('Failed to get recovery progress', error);
      return [];
    }

    return (logs as DailyRecoveryLog[]).map((log) =>
      this.mapToRecoveryProgress(log),
    );
  }

  /**
   * Get the latest recovery progress entry
   */
  async getLatestProgress(
    userId: string,
  ): Promise<RecoveryProgress | undefined> {
    const client = this.supabase.getAdminClient();

    const patientProfile = await this.getPatientProfile(userId);
    if (!patientProfile) {
      return undefined;
    }

    const { data: log, error } = await client
      .from('daily_recovery_logs')
      .select('*')
      .eq('patient_id', patientProfile.id)
      .order('log_date', { ascending: false })
      .limit(1)
      .single();

    if (error || !log) {
      return undefined;
    }

    return this.mapToRecoveryProgress(log as DailyRecoveryLog);
  }

  /**
   * Get dashboard statistics for the patient
   */
  async getDashboardStats(userId: string) {
    const client = this.supabase.getAdminClient();

    const patientProfile = await this.getPatientProfile(userId);
    if (!patientProfile) {
      return this.getDefaultDashboardStats();
    }

    const daysSinceSurgery = this.calculateDayCount(
      patientProfile.recovery_start_date,
    );

    // Get last 7 days of logs for weekly averages
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: logs, error } = await client
      .from('daily_recovery_logs')
      .select('*')
      .eq('patient_id', patientProfile.id)
      .gte('log_date', sevenDaysAgo.toISOString().split('T')[0])
      .order('log_date', { ascending: false });

    if (error) {
      this.logger.error('Failed to get dashboard stats', error);
      return this.getDefaultDashboardStats();
    }

    const typedLogs = logs as DailyRecoveryLog[];
    const latest = typedLogs[0];

    // Calculate weekly averages
    const weeklyProgress = {
      medicineAdherence: this.calculateAverage(
        typedLogs,
        'medicine_adherence_percent',
      ),
      exerciseConsistency: this.calculateAverage(
        typedLogs,
        'exercise_completion_percent',
      ),
      averagePainScore: this.calculateAverage(typedLogs, 'pain_score'),
    };

    return {
      daysSinceSurgery,
      recoveryScore: latest?.recovery_score ?? 0,
      recoveryTrend: latest?.trend ?? 'stable',
      weeklyProgress,
    };
  }

  /**
   * Get or create recovery profile for patient
   */
  async getRecoveryProfile(userId: string): Promise<RecoveryProfile | null> {
    const client = this.supabase.getAdminClient();

    const patientProfile = await this.getPatientProfile(userId);
    if (!patientProfile) {
      return null;
    }

    const { data: profile, error } = await client
      .from('recovery_profiles')
      .select('*')
      .eq('patient_id', patientProfile.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !profile) {
      return null;
    }

    return profile as RecoveryProfile;
  }

  // ======== Helper Methods ========

  private async getPatientProfile(
    userId: string,
  ): Promise<PatientProfile | null> {
    const client = this.supabase.getAdminClient();

    const { data, error } = await client
      .from('patient_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as PatientProfile;
  }

  private calculateDayCount(recoveryStartDate?: string): number {
    if (!recoveryStartDate) return 1;

    const startDate = new Date(recoveryStartDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  private calculateRecoveryScore(data: Partial<RecoveryProgress>): number {
    // Recovery score algorithm (0-100)
    // Based on medicine adherence, exercise, pain, mood, swelling
    let score = 50;

    // Medicine adherence (max 30 points)
    if (data.medicineAdherence !== undefined) {
      score += ((data.medicineAdherence - 50) * 30) / 100;
    }

    // Exercise consistency (max 25 points)
    if (data.exerciseConsistency !== undefined) {
      score += ((data.exerciseConsistency - 50) * 25) / 100;
    }

    // Pain score (inverse, max 25 points) - lower pain = higher score
    if (data.painScore !== undefined) {
      score += ((10 - data.painScore) * 25) / 10;
    }

    // Mood (max 10 points)
    const moodScores: Record<string, number> = {
      great: 10,
      good: 8,
      ok: 6,
      low: 4,
      pain: 3,
      struggling: 2,
    };
    score += moodScores[data.mood || 'ok'] || 6;

    // Swelling (max 10 points)
    const swellingScores: Record<string, number> = {
      none: 10,
      mild: 7,
      moderate: 4,
      severe: 1,
    };
    score += swellingScores[data.swellingStatus || 'mild'] || 5;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private async calculateTrend(
    patientId: string,
    currentScore: number,
  ): Promise<RecoveryTrend> {
    const client = this.supabase.getAdminClient();

    // Get last 7 days scores
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: logs } = await client
      .from('daily_recovery_logs')
      .select('recovery_score')
      .eq('patient_id', patientId)
      .gte('log_date', sevenDaysAgo.toISOString().split('T')[0])
      .order('log_date', { ascending: false });

    if (!logs || logs.length < 3) {
      return 'stable';
    }

    const avgScore =
      logs.reduce(
        (sum, log) =>
          sum + ((log as { recovery_score: number }).recovery_score || 0),
        0,
      ) / logs.length;

    if (currentScore >= avgScore + 5) return 'improving';
    if (currentScore <= avgScore - 20) return 'critical';
    if (currentScore <= avgScore - 10) return 'warning';
    return 'stable';
  }

  private calculateAverage(
    logs: DailyRecoveryLog[],
    field: keyof DailyRecoveryLog,
  ): number {
    if (logs.length === 0) return 0;

    const sum = logs.reduce((acc, log) => {
      const value = log[field];
      return acc + (typeof value === 'number' ? value : 0);
    }, 0);

    return Math.round(sum / logs.length);
  }

  private mapToRecoveryProgress(log: DailyRecoveryLog): RecoveryProgress {
    // Map 'low' mood to 'pain' for API compatibility
    const moodMapping: Record<string, string> = {
      great: 'great',
      good: 'good',
      ok: 'ok',
      low: 'low',
      struggling: 'struggling',
    };

    return {
      id: log.id,
      patientId: log.patient_id,
      date: log.log_date,
      dayCount: log.day_number ?? 1,
      medicineAdherence: log.medicine_adherence_percent,
      exerciseConsistency: log.exercise_completion_percent,
      painScore: log.pain_score ?? 5,
      swellingStatus: (log.swelling ||
        'mild') as RecoveryProgress['swellingStatus'],
      mood: (moodMapping[log.mood || 'ok'] || 'ok') as RecoveryProgress['mood'],
      recoveryScore: log.recovery_score ?? 0,
      trend: (log.trend || 'stable') as RecoveryProgress['trend'],
      notes: log.notes,
    };
  }

  private getDefaultDashboardStats() {
    return {
      daysSinceSurgery: 0,
      recoveryScore: 0,
      recoveryTrend: 'stable' as const,
      weeklyProgress: {
        medicineAdherence: 0,
        exerciseConsistency: 0,
        averagePainScore: 0,
      },
    };
  }
}
