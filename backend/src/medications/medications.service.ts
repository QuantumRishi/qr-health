import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { SupabaseService } from '../common/supabase';
import {
  Medication as DbMedication,
  MedicationLog as DbMedicationLog,
  PatientProfile,
  TaskFrequency,
  TaskStatus,
} from '../types';

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  instructions?: string;
  isActive: boolean;
  startDate: string;
  endDate?: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  patientId: string;
  scheduledTime: string;
  takenAt?: string;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
}

@Injectable()
export class MedicationsService {
  private readonly logger = new Logger(MedicationsService.name);

  constructor(private supabase: SupabaseService) {}

  /**
   * Create a new medication for a patient
   */
  async create(userId: string, data: Partial<Medication>): Promise<Medication> {
    const client = this.supabase.getAdminClient();

    const patientProfile = await this.getPatientProfile(userId);
    if (!patientProfile) {
      throw new NotFoundException('Patient profile not found');
    }

    // Map frequency to database enum
    const frequencyMapping: Record<string, TaskFrequency> = {
      once_daily: 'daily',
      twice_daily: 'twice_daily',
      three_times_daily: 'three_times_daily',
      four_times_daily: 'three_times_daily', // Map to closest
      as_needed: 'custom',
      weekly: 'weekly',
      daily: 'daily',
    };

    const { data: medication, error } = await client
      .from('medications')
      .insert({
        patient_id: patientProfile.id,
        tenant_id: patientProfile.tenant_id,
        name: data.name || '',
        dosage: data.dosage || '',
        frequency: frequencyMapping[data.frequency || 'daily'] || 'daily',
        times: data.times || ['08:00'],
        instructions: data.instructions,
        is_active: true,
        start_date: data.startDate || new Date().toISOString().split('T')[0],
        end_date: data.endDate,
        with_food: false,
        is_prn: false,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Failed to create medication', error);
      throw new Error(`Failed to create medication: ${error.message}`);
    }

    return this.mapToMedication(medication as DbMedication, userId);
  }

  /**
   * Get all medications for a patient
   */
  async findAll(userId: string): Promise<Medication[]> {
    const client = this.supabase.getAdminClient();

    const patientProfile = await this.getPatientProfile(userId);
    if (!patientProfile) {
      return [];
    }

    const { data: medications, error } = await client
      .from('medications')
      .select('*')
      .eq('patient_id', patientProfile.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Failed to get medications', error);
      return [];
    }

    return (medications as DbMedication[]).map((med) =>
      this.mapToMedication(med, userId),
    );
  }

  /**
   * Get a single medication by ID
   */
  async findOne(userId: string, id: string): Promise<Medication | undefined> {
    const client = this.supabase.getAdminClient();

    const patientProfile = await this.getPatientProfile(userId);
    if (!patientProfile) {
      return undefined;
    }

    const { data: medication, error } = await client
      .from('medications')
      .select('*')
      .eq('id', id)
      .eq('patient_id', patientProfile.id)
      .single();

    if (error || !medication) {
      return undefined;
    }

    return this.mapToMedication(medication as DbMedication, userId);
  }

  /**
   * Update a medication
   */
  async update(
    userId: string,
    id: string,
    data: Partial<Medication>,
  ): Promise<Medication> {
    const client = this.supabase.getAdminClient();

    const patientProfile = await this.getPatientProfile(userId);
    if (!patientProfile) {
      throw new NotFoundException('Patient profile not found');
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.dosage !== undefined) updateData.dosage = data.dosage;
    if (data.times !== undefined) updateData.times = data.times;
    if (data.instructions !== undefined)
      updateData.instructions = data.instructions;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;
    if (data.endDate !== undefined) updateData.end_date = data.endDate;

    const { data: medication, error } = await client
      .from('medications')
      .update(updateData)
      .eq('id', id)
      .eq('patient_id', patientProfile.id)
      .select()
      .single();

    if (error || !medication) {
      throw new NotFoundException('Medication not found');
    }

    return this.mapToMedication(medication as DbMedication, userId);
  }

  /**
   * Delete (deactivate) a medication
   */
  async delete(userId: string, id: string): Promise<void> {
    const client = this.supabase.getAdminClient();

    const patientProfile = await this.getPatientProfile(userId);
    if (!patientProfile) {
      throw new NotFoundException('Patient profile not found');
    }

    const { error } = await client
      .from('medications')
      .update({ is_active: false })
      .eq('id', id)
      .eq('patient_id', patientProfile.id);

    if (error) {
      this.logger.error('Failed to delete medication', error);
      throw new Error(`Failed to delete medication: ${error.message}`);
    }
  }

  /**
   * Log medication intake status
   */
  async logMedication(
    userId: string,
    medicationId: string,
    status: MedicationLog['status'],
  ): Promise<MedicationLog> {
    const client = this.supabase.getAdminClient();

    const patientProfile = await this.getPatientProfile(userId);
    if (!patientProfile) {
      throw new NotFoundException('Patient profile not found');
    }

    // Map status to database enum
    const statusMapping: Record<string, TaskStatus> = {
      pending: 'pending',
      taken: 'done',
      missed: 'missed',
      skipped: 'skipped',
    };

    const now = new Date();
    const scheduledDate = now.toISOString().split('T')[0];
    const scheduledTime = now.toTimeString().split(' ')[0].substring(0, 5);

    const { data: log, error } = await client
      .from('medication_logs')
      .upsert(
        {
          medication_id: medicationId,
          patient_id: patientProfile.id,
          tenant_id: patientProfile.tenant_id,
          scheduled_date: scheduledDate,
          scheduled_time: scheduledTime,
          status: statusMapping[status] || 'pending',
          taken_at: status === 'taken' ? now.toISOString() : null,
          had_side_effects: false,
        },
        {
          onConflict: 'medication_id,scheduled_date,scheduled_time',
        },
      )
      .select()
      .single();

    if (error) {
      this.logger.error('Failed to log medication', error);
      throw new Error(`Failed to log medication: ${error.message}`);
    }

    return this.mapToMedicationLog(log as DbMedicationLog, userId);
  }

  /**
   * Get today's medication schedule
   */
  async getTodaySchedule(userId: string): Promise<any[]> {
    const client = this.supabase.getAdminClient();

    const patientProfile = await this.getPatientProfile(userId);
    if (!patientProfile) {
      return [];
    }

    const today = new Date().toISOString().split('T')[0];

    // Get all active medications
    const { data: medications, error: medError } = await client
      .from('medications')
      .select('*')
      .eq('patient_id', patientProfile.id)
      .eq('is_active', true);

    if (medError || !medications) {
      this.logger.error('Failed to get medications', medError);
      return [];
    }

    // Get today's logs
    const { data: logs, error: logError } = await client
      .from('medication_logs')
      .select('*')
      .eq('patient_id', patientProfile.id)
      .eq('scheduled_date', today);

    if (logError) {
      this.logger.error('Failed to get medication logs', logError);
    }

    const typedLogs = (logs || []) as DbMedicationLog[];
    const schedule: any[] = [];

    for (const med of medications as DbMedication[]) {
      const times = med.times || ['08:00'];
      for (const time of times) {
        const todayLog = typedLogs.find(
          (l) => l.medication_id === med.id && l.scheduled_time === time,
        );

        // Map database status to API status
        const statusMapping: Record<TaskStatus, string> = {
          pending: 'pending',
          done: 'taken',
          missed: 'missed',
          skipped: 'skipped',
        };

        schedule.push({
          medicationId: med.id,
          medication: `${med.name} ${med.dosage || ''}`.trim(),
          time,
          status: todayLog ? statusMapping[todayLog.status] : 'pending',
          instructions: med.instructions,
        });
      }
    }

    return schedule.sort((a, b) => a.time.localeCompare(b.time));
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

  private mapToMedication(med: DbMedication, userId: string): Medication {
    // Map frequency from database enum to API format
    const frequencyMapping: Record<TaskFrequency, string> = {
      once: 'once_daily',
      daily: 'once_daily',
      twice_daily: 'twice_daily',
      three_times_daily: 'three_times_daily',
      weekly: 'weekly',
      custom: 'as_needed',
    };

    return {
      id: med.id,
      patientId: userId,
      name: med.name,
      dosage: med.dosage || '',
      frequency: frequencyMapping[med.frequency] || 'once_daily',
      times: med.times || [],
      instructions: med.instructions,
      isActive: med.is_active,
      startDate: med.start_date || '',
      endDate: med.end_date,
    };
  }

  private mapToMedicationLog(
    log: DbMedicationLog,
    userId: string,
  ): MedicationLog {
    // Map status from database to API format
    const statusMapping: Record<TaskStatus, MedicationLog['status']> = {
      pending: 'pending',
      done: 'taken',
      missed: 'missed',
      skipped: 'skipped',
    };

    return {
      id: log.id,
      medicationId: log.medication_id,
      patientId: userId,
      scheduledTime: `${log.scheduled_date}T${log.scheduled_time}`,
      takenAt: log.taken_at || undefined,
      status: statusMapping[log.status],
    };
  }
}
