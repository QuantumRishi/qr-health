import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { SupabaseService } from '../common/supabase';
import {
  ViewerAccess,
  PatientProfile,
  DailyRecoveryLog,
  AccessLevel,
  UpdateFrequency,
} from '../types';

export interface FamilyMember {
  id: string;
  patientId: string;
  name: string;
  email: string;
  relationship: string;
  permissions: FamilyPermissions;
  addedAt: string;
}

export interface FamilyPermissions {
  canViewProgress: boolean;
  canViewMedications: boolean;
  canViewExercises: boolean;
  canViewMood: boolean;
  notificationFrequency: 'daily' | 'weekly' | 'milestone' | 'none';
}

@Injectable()
export class FamilyService {
  private readonly logger = new Logger(FamilyService.name);

  constructor(private supabase: SupabaseService) {}

  /**
   * Add a family member/viewer to patient's account
   */
  async addMember(
    userId: string,
    data: Partial<FamilyMember>,
  ): Promise<FamilyMember> {
    const client = this.supabase.getAdminClient();

    const patientProfile = await this.getPatientProfile(userId);
    if (!patientProfile) {
      throw new NotFoundException('Patient profile not found');
    }

    // Map permissions to database fields
    const permissions = data.permissions || {
      canViewProgress: true,
      canViewMedications: false,
      canViewExercises: false,
      canViewMood: true,
      notificationFrequency: 'daily',
    };

    // Map notification frequency to database enum
    const frequencyMapping: Record<string, UpdateFrequency> = {
      daily: 'daily',
      weekly: 'weekly',
      milestone: 'milestone_only',
      none: 'daily', // Default to daily if none
    };

    const { data: viewerAccess, error } = await client
      .from('viewer_access')
      .insert({
        patient_id: patientProfile.id,
        tenant_id: patientProfile.tenant_id,
        viewer_email: data.email || '',
        viewer_name: data.name || '',
        relationship: data.relationship || '',
        access_level: 'summary_only' as AccessLevel,
        update_frequency:
          frequencyMapping[permissions.notificationFrequency] || 'daily',
        can_view_progress: permissions.canViewProgress,
        can_view_medications: permissions.canViewMedications,
        can_view_exercises: permissions.canViewExercises,
        can_view_mood: permissions.canViewMood,
        can_view_pain_score: false,
        can_receive_alerts: true,
        is_accepted: false,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Failed to add family member', error);
      throw new Error(`Failed to add family member: ${error.message}`);
    }

    return this.mapToFamilyMember(viewerAccess as ViewerAccess, userId);
  }

  /**
   * Get all family members/viewers for a patient
   */
  async getMembers(userId: string): Promise<FamilyMember[]> {
    const client = this.supabase.getAdminClient();

    const patientProfile = await this.getPatientProfile(userId);
    if (!patientProfile) {
      return [];
    }

    const { data: viewers, error } = await client
      .from('viewer_access')
      .select('*')
      .eq('patient_id', patientProfile.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Failed to get family members', error);
      return [];
    }

    return (viewers as ViewerAccess[]).map((v) =>
      this.mapToFamilyMember(v, userId),
    );
  }

  /**
   * Update family member permissions
   */
  async updatePermissions(
    userId: string,
    memberId: string,
    permissions: Partial<FamilyPermissions>,
  ): Promise<FamilyMember> {
    const client = this.supabase.getAdminClient();

    const patientProfile = await this.getPatientProfile(userId);
    if (!patientProfile) {
      throw new NotFoundException('Patient profile not found');
    }

    const updateData: Record<string, unknown> = {};
    if (permissions.canViewProgress !== undefined)
      updateData.can_view_progress = permissions.canViewProgress;
    if (permissions.canViewMedications !== undefined)
      updateData.can_view_medications = permissions.canViewMedications;
    if (permissions.canViewExercises !== undefined)
      updateData.can_view_exercises = permissions.canViewExercises;
    if (permissions.canViewMood !== undefined)
      updateData.can_view_mood = permissions.canViewMood;
    if (permissions.notificationFrequency !== undefined) {
      const frequencyMapping: Record<string, UpdateFrequency> = {
        daily: 'daily',
        weekly: 'weekly',
        milestone: 'milestone_only',
        none: 'daily',
      };
      updateData.update_frequency =
        frequencyMapping[permissions.notificationFrequency];
    }

    const { data: viewerAccess, error } = await client
      .from('viewer_access')
      .update(updateData)
      .eq('id', memberId)
      .eq('patient_id', patientProfile.id)
      .select()
      .single();

    if (error || !viewerAccess) {
      throw new NotFoundException('Family member not found');
    }

    return this.mapToFamilyMember(viewerAccess as ViewerAccess, userId);
  }

  /**
   * Remove a family member/viewer
   */
  async removeMember(userId: string, memberId: string): Promise<void> {
    const client = this.supabase.getAdminClient();

    const patientProfile = await this.getPatientProfile(userId);
    if (!patientProfile) {
      throw new NotFoundException('Patient profile not found');
    }

    const { error } = await client
      .from('viewer_access')
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
      })
      .eq('id', memberId)
      .eq('patient_id', patientProfile.id);

    if (error) {
      this.logger.error('Failed to remove family member', error);
      throw new Error(`Failed to remove family member: ${error.message}`);
    }
  }

  /**
   * Get patient progress for family viewer (respecting permissions)
   */
  async getPatientProgressForFamily(
    patientId: string,
    memberId: string,
  ): Promise<any> {
    const client = this.supabase.getAdminClient();

    // Get viewer access record
    const { data: viewerAccess, error: accessError } = await client
      .from('viewer_access')
      .select('*')
      .eq('id', memberId)
      .eq('patient_id', patientId)
      .eq('is_active', true)
      .single();

    if (accessError || !viewerAccess) {
      throw new NotFoundException('Access denied');
    }

    const viewer = viewerAccess as ViewerAccess;

    // Get patient's latest recovery data
    const { data: patientProfile } = await client
      .from('patient_profiles')
      .select('*')
      .eq('id', patientId)
      .single();

    if (!patientProfile) {
      throw new NotFoundException('Patient not found');
    }

    // Get latest daily log
    const { data: latestLog } = await client
      .from('daily_recovery_logs')
      .select('*')
      .eq('patient_id', patientId)
      .order('log_date', { ascending: false })
      .limit(1)
      .single();

    const log = latestLog as DailyRecoveryLog | null;
    const profile = patientProfile as PatientProfile;

    // Build response based on permissions
    const result: Record<string, unknown> = {
      patientName: profile.display_name,
    };

    if (viewer.can_view_progress) {
      result.recoveryScore = log?.recovery_score ?? 0;
      result.daysSinceSurgery = this.calculateDaysSince(
        profile.recovery_start_date,
      );
      result.trend = log?.trend ?? 'stable';
      result.medicineAdherence = log?.medicine_adherence_percent ?? 0;
      result.exerciseCompletion = log?.exercise_completion_percent ?? 0;
    }

    if (viewer.can_view_medications) {
      result.medicationsTaken = (log?.medicine_adherence_percent ?? 0) > 80;
    }

    if (viewer.can_view_exercises) {
      result.exercisesCompleted = (log?.exercise_completion_percent ?? 0) > 80;
    }

    if (viewer.can_view_mood) {
      result.currentMood = log?.mood ?? 'ok';
    }

    if (viewer.can_view_pain_score) {
      result.painScore = log?.pain_score ?? 5;
    }

    return result;
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

  private calculateDaysSince(startDate?: string): number {
    if (!startDate) return 0;

    const start = new Date(startDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private mapToFamilyMember(
    viewer: ViewerAccess,
    patientUserId: string,
  ): FamilyMember {
    // Map update frequency to notification frequency
    const frequencyMapping: Record<
      UpdateFrequency,
      FamilyPermissions['notificationFrequency']
    > = {
      realtime: 'daily',
      daily: 'daily',
      weekly: 'weekly',
      milestone_only: 'milestone',
    };

    return {
      id: viewer.id,
      patientId: patientUserId,
      name: viewer.viewer_name || '',
      email: viewer.viewer_email,
      relationship: viewer.relationship || '',
      permissions: {
        canViewProgress: viewer.can_view_progress,
        canViewMedications: viewer.can_view_medications,
        canViewExercises: viewer.can_view_exercises,
        canViewMood: viewer.can_view_mood,
        notificationFrequency:
          frequencyMapping[viewer.update_frequency] || 'daily',
      },
      addedAt: viewer.created_at,
    };
  }
}
