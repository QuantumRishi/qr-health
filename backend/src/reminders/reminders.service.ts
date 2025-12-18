import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase';
import {
  TaskSchedule,
  PatientProfile,
  TaskType,
  TaskFrequency,
} from '../types';

export interface Reminder {
  id: string;
  patientId: string;
  type: 'medication' | 'exercise' | 'meal' | 'hydration' | 'custom';
  title: string;
  message: string;
  scheduledTime: string;
  recurring: boolean;
  isActive: boolean;
}

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(private supabase: SupabaseService) {}

  /**
   * Create a new reminder (task schedule)
   */
  async create(userId: string, data: Partial<Reminder>): Promise<Reminder> {
    const client = this.supabase.getAdminClient();

    const patientProfile = await this.getPatientProfile(userId);
    if (!patientProfile) {
      throw new NotFoundException('Patient profile not found');
    }

    // Map reminder type to task type
    const typeMapping: Record<string, TaskType> = {
      medication: 'medicine',
      exercise: 'exercise',
      meal: 'meal',
      hydration: 'hydration',
      custom: 'custom',
    };

    const { data: task, error } = await client
      .from('task_schedules')
      .insert({
        patient_id: patientProfile.id,
        tenant_id: patientProfile.tenant_id,
        task_type: typeMapping[data.type || 'custom'] || 'custom',
        title: data.title || '',
        description: data.message || '',
        frequency: data.recurring ? 'daily' : ('once' as TaskFrequency),
        time_slots: data.scheduledTime ? [data.scheduledTime] : ['09:00'],
        days_of_week: [0, 1, 2, 3, 4, 5, 6],
        is_active: true,
        sort_order: 0,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Failed to create reminder', error);
      throw new Error(`Failed to create reminder: ${error.message}`);
    }

    return this.mapToReminder(task as TaskSchedule, userId);
  }

  /**
   * Get all reminders for a patient
   */
  async findAll(userId: string): Promise<Reminder[]> {
    const client = this.supabase.getAdminClient();

    const patientProfile = await this.getPatientProfile(userId);
    if (!patientProfile) {
      return [];
    }

    const { data: tasks, error } = await client
      .from('task_schedules')
      .select('*')
      .eq('patient_id', patientProfile.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      this.logger.error('Failed to get reminders', error);
      return [];
    }

    return (tasks as TaskSchedule[]).map((task) =>
      this.mapToReminder(task, userId),
    );
  }

  /**
   * Get upcoming reminders for today
   */
  async getUpcoming(userId: string): Promise<Reminder[]> {
    const client = this.supabase.getAdminClient();

    const patientProfile = await this.getPatientProfile(userId);
    if (!patientProfile) {
      return [];
    }

    const dayOfWeek = new Date().getDay();
    const currentTime = new Date().toTimeString().substring(0, 5);

    const { data: tasks, error } = await client
      .from('task_schedules')
      .select('*')
      .eq('patient_id', patientProfile.id)
      .eq('is_active', true)
      .contains('days_of_week', [dayOfWeek])
      .order('time_slots', { ascending: true })
      .limit(10);

    if (error) {
      this.logger.error('Failed to get upcoming reminders', error);
      return [];
    }

    // Filter to only upcoming times
    const reminders = (tasks as TaskSchedule[])
      .filter((task) => {
        const times = task.time_slots || [];
        return times.some((time) => time >= currentTime);
      })
      .slice(0, 5)
      .map((task) => this.mapToReminder(task, userId));

    return reminders;
  }

  /**
   * Delete (deactivate) a reminder
   */
  async delete(userId: string, id: string): Promise<void> {
    const client = this.supabase.getAdminClient();

    const patientProfile = await this.getPatientProfile(userId);
    if (!patientProfile) {
      throw new NotFoundException('Patient profile not found');
    }

    const { error } = await client
      .from('task_schedules')
      .update({ is_active: false })
      .eq('id', id)
      .eq('patient_id', patientProfile.id);

    if (error) {
      this.logger.error('Failed to delete reminder', error);
      throw new Error(`Failed to delete reminder: ${error.message}`);
    }
  }

  /**
   * Toggle reminder active status
   */
  async toggle(userId: string, id: string): Promise<Reminder> {
    const client = this.supabase.getAdminClient();

    const patientProfile = await this.getPatientProfile(userId);
    if (!patientProfile) {
      throw new NotFoundException('Patient profile not found');
    }

    // Get current state
    const { data: current, error: getError } = await client
      .from('task_schedules')
      .select('is_active')
      .eq('id', id)
      .eq('patient_id', patientProfile.id)
      .single();

    if (getError || !current) {
      throw new NotFoundException('Reminder not found');
    }

    // Toggle
    const { data: task, error } = await client
      .from('task_schedules')
      .update({ is_active: !current.is_active })
      .eq('id', id)
      .eq('patient_id', patientProfile.id)
      .select()
      .single();

    if (error || !task) {
      throw new Error('Failed to toggle reminder');
    }

    return this.mapToReminder(task as TaskSchedule, userId);
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

  private mapToReminder(task: TaskSchedule, userId: string): Reminder {
    // Map task type to reminder type
    const typeMapping: Record<TaskType, Reminder['type']> = {
      medicine: 'medication',
      exercise: 'exercise',
      meal: 'meal',
      hydration: 'hydration',
      custom: 'custom',
    };

    const times = task.time_slots || ['09:00'];
    const firstTime = times[0] || '09:00';

    return {
      id: task.id,
      patientId: userId,
      type: typeMapping[task.task_type] || 'custom',
      title: task.title,
      message: task.description || '',
      scheduledTime: firstTime,
      recurring: task.frequency !== 'once',
      isActive: task.is_active,
    };
  }
}
