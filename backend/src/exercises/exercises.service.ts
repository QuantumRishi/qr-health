import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { SupabaseService } from '../common/supabase';
import {
  Exercise as DbExercise,
  ExerciseLog as DbExerciseLog,
  PatientProfile,
  TaskFrequency,
  TaskStatus,
} from '../types';

export interface Exercise {
  id: string;
  patientId: string;
  name: string;
  description: string;
  duration: number;
  frequency: string;
  scheduledDays: number[];
  instructions: string[];
  isActive: boolean;
}

export interface ExerciseLog {
  id: string;
  exerciseId: string;
  patientId: string;
  scheduledDate: string;
  completedAt?: string;
  status: 'pending' | 'completed' | 'skipped' | 'partial';
  painLevel?: number;
  notes?: string;
}

@Injectable()
export class ExercisesService {
  private readonly logger = new Logger(ExercisesService.name);

  constructor(private supabase: SupabaseService) {}

  /**
   * Create a new exercise for a patient
   */
  async create(userId: string, data: Partial<Exercise>): Promise<Exercise> {
    const client = this.supabase.getAdminClient();

    const patientProfile = await this.getPatientProfile(userId);
    if (!patientProfile) {
      throw new NotFoundException('Patient profile not found');
    }

    // Map frequency to database enum
    const frequencyMapping: Record<string, TaskFrequency> = {
      daily: 'daily',
      alternate_days: 'custom',
      weekly: 'weekly',
      twice_weekly: 'custom',
      three_times_weekly: 'custom',
    };

    const { data: exercise, error } = await client
      .from('exercises')
      .insert({
        patient_id: patientProfile.id,
        tenant_id: patientProfile.tenant_id,
        name: data.name || '',
        description: data.description || '',
        instructions: (data.instructions || []).join('\n'),
        frequency: frequencyMapping[data.frequency || 'daily'] || 'daily',
        duration_minutes: data.duration || 5,
        days_of_week: data.scheduledDays || [0, 1, 2, 3, 4, 5, 6],
        is_active: true,
        max_pain_threshold: 5,
        start_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Failed to create exercise', error);
      throw new Error(`Failed to create exercise: ${error.message}`);
    }

    return this.mapToExercise(exercise as DbExercise, userId);
  }

  /**
   * Get all exercises for a patient
   */
  async findAll(userId: string): Promise<Exercise[]> {
    const client = this.supabase.getAdminClient();

    const patientProfile = await this.getPatientProfile(userId);
    if (!patientProfile) {
      return [];
    }

    const { data: exercises, error } = await client
      .from('exercises')
      .select('*')
      .eq('patient_id', patientProfile.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Failed to get exercises', error);
      return [];
    }

    return (exercises as DbExercise[]).map((ex) =>
      this.mapToExercise(ex, userId),
    );
  }

  /**
   * Get a single exercise by ID
   */
  async findOne(userId: string, id: string): Promise<Exercise | undefined> {
    const client = this.supabase.getAdminClient();

    const patientProfile = await this.getPatientProfile(userId);
    if (!patientProfile) {
      return undefined;
    }

    const { data: exercise, error } = await client
      .from('exercises')
      .select('*')
      .eq('id', id)
      .eq('patient_id', patientProfile.id)
      .single();

    if (error || !exercise) {
      return undefined;
    }

    return this.mapToExercise(exercise as DbExercise, userId);
  }

  /**
   * Update an exercise
   */
  async update(
    userId: string,
    id: string,
    data: Partial<Exercise>,
  ): Promise<Exercise> {
    const client = this.supabase.getAdminClient();

    const patientProfile = await this.getPatientProfile(userId);
    if (!patientProfile) {
      throw new NotFoundException('Patient profile not found');
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.duration !== undefined)
      updateData.duration_minutes = data.duration;
    if (data.scheduledDays !== undefined)
      updateData.days_of_week = data.scheduledDays;
    if (data.instructions !== undefined)
      updateData.instructions = data.instructions.join('\n');
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    const { data: exercise, error } = await client
      .from('exercises')
      .update(updateData)
      .eq('id', id)
      .eq('patient_id', patientProfile.id)
      .select()
      .single();

    if (error || !exercise) {
      throw new NotFoundException('Exercise not found');
    }

    return this.mapToExercise(exercise as DbExercise, userId);
  }

  /**
   * Delete (deactivate) an exercise
   */
  async delete(userId: string, id: string): Promise<void> {
    const client = this.supabase.getAdminClient();

    const patientProfile = await this.getPatientProfile(userId);
    if (!patientProfile) {
      throw new NotFoundException('Patient profile not found');
    }

    const { error } = await client
      .from('exercises')
      .update({ is_active: false })
      .eq('id', id)
      .eq('patient_id', patientProfile.id);

    if (error) {
      this.logger.error('Failed to delete exercise', error);
      throw new Error(`Failed to delete exercise: ${error.message}`);
    }
  }

  /**
   * Log exercise completion status
   */
  async logExercise(
    userId: string,
    exerciseId: string,
    data: { status: ExerciseLog['status']; painLevel?: number; notes?: string },
  ): Promise<ExerciseLog> {
    const client = this.supabase.getAdminClient();

    const patientProfile = await this.getPatientProfile(userId);
    if (!patientProfile) {
      throw new NotFoundException('Patient profile not found');
    }

    // Map status to database enum
    const statusMapping: Record<string, TaskStatus> = {
      pending: 'pending',
      completed: 'done',
      skipped: 'skipped',
      partial: 'pending', // Map partial to pending to preserve it for retry
    };

    const today = new Date().toISOString().split('T')[0];

    const { data: log, error } = await client
      .from('exercise_logs')
      .upsert(
        {
          exercise_id: exerciseId,
          patient_id: patientProfile.id,
          tenant_id: patientProfile.tenant_id,
          scheduled_date: today,
          status: statusMapping[data.status] || 'pending',
          completed_at:
            data.status === 'completed' ? new Date().toISOString() : null,
          pain_during: data.painLevel,
          notes: data.notes,
        },
        {
          onConflict: 'exercise_id,scheduled_date',
        },
      )
      .select()
      .single();

    if (error) {
      this.logger.error('Failed to log exercise', error);
      throw new Error(`Failed to log exercise: ${error.message}`);
    }

    return this.mapToExerciseLog(log as DbExerciseLog, userId);
  }

  /**
   * Get today's exercise schedule
   */
  async getTodaySchedule(userId: string): Promise<any[]> {
    const client = this.supabase.getAdminClient();

    const patientProfile = await this.getPatientProfile(userId);
    if (!patientProfile) {
      return [];
    }

    const today = new Date().toISOString().split('T')[0];
    const dayOfWeek = new Date().getDay();

    // Get all active exercises
    const { data: exercises, error: exError } = await client
      .from('exercises')
      .select('*')
      .eq('patient_id', patientProfile.id)
      .eq('is_active', true);

    if (exError || !exercises) {
      this.logger.error('Failed to get exercises', exError);
      return [];
    }

    // Get today's logs
    const { data: logs, error: logError } = await client
      .from('exercise_logs')
      .select('*')
      .eq('patient_id', patientProfile.id)
      .eq('scheduled_date', today);

    if (logError) {
      this.logger.error('Failed to get exercise logs', logError);
    }

    const typedLogs = (logs || []) as DbExerciseLog[];
    const schedule: any[] = [];

    for (const ex of exercises as DbExercise[]) {
      // Check if exercise is scheduled for today
      const scheduledDays = ex.days_of_week || [0, 1, 2, 3, 4, 5, 6];
      if (!scheduledDays.includes(dayOfWeek)) continue;

      const todayLog = typedLogs.find((l) => l.exercise_id === ex.id);

      // Map database status to API status
      const statusMapping: Record<TaskStatus, string> = {
        pending: 'pending',
        done: 'completed',
        missed: 'pending',
        skipped: 'skipped',
      };

      schedule.push({
        exerciseId: ex.id,
        exercise: ex.name,
        duration: ex.duration_minutes,
        description: ex.description,
        status: todayLog ? statusMapping[todayLog.status] : 'pending',
      });
    }

    return schedule;
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

  private mapToExercise(ex: DbExercise, userId: string): Exercise {
    // Map frequency from database enum to API format
    const frequencyMapping: Record<TaskFrequency, string> = {
      once: 'daily',
      daily: 'daily',
      twice_daily: 'daily',
      three_times_daily: 'daily',
      weekly: 'weekly',
      custom: 'alternate_days',
    };

    return {
      id: ex.id,
      patientId: userId,
      name: ex.name,
      description: ex.description || '',
      duration: ex.duration_minutes,
      frequency: frequencyMapping[ex.frequency] || 'daily',
      scheduledDays: ex.days_of_week || [],
      instructions: ex.instructions ? ex.instructions.split('\n') : [],
      isActive: ex.is_active,
    };
  }

  private mapToExerciseLog(log: DbExerciseLog, userId: string): ExerciseLog {
    // Map status from database to API format
    const statusMapping: Record<TaskStatus, ExerciseLog['status']> = {
      pending: 'pending',
      done: 'completed',
      missed: 'pending',
      skipped: 'skipped',
    };

    return {
      id: log.id,
      exerciseId: log.exercise_id,
      patientId: userId,
      scheduledDate: log.scheduled_date,
      completedAt: log.completed_at || undefined,
      status: statusMapping[log.status],
      painLevel: log.pain_during,
      notes: log.notes,
    };
  }
}
