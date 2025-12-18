import { Injectable, NotFoundException } from '@nestjs/common';

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
  private medications: Map<string, Medication[]> = new Map();
  private logs: Map<string, MedicationLog[]> = new Map();

  async create(
    patientId: string,
    data: Partial<Medication>,
  ): Promise<Medication> {
    const id = `med_${Date.now()}`;
    const medication: Medication = {
      id,
      patientId,
      name: data.name || '',
      dosage: data.dosage || '',
      frequency: data.frequency || 'once_daily',
      times: data.times || ['08:00'],
      instructions: data.instructions,
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
    };

    const existing = this.medications.get(patientId) || [];
    existing.push(medication);
    this.medications.set(patientId, existing);

    return medication;
  }

  async findAll(patientId: string): Promise<Medication[]> {
    return this.medications.get(patientId) || [];
  }

  async findOne(
    patientId: string,
    id: string,
  ): Promise<Medication | undefined> {
    const meds = this.medications.get(patientId) || [];
    return meds.find((m) => m.id === id);
  }

  async update(
    patientId: string,
    id: string,
    data: Partial<Medication>,
  ): Promise<Medication> {
    const meds = this.medications.get(patientId) || [];
    const index = meds.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new NotFoundException('Medication not found');
    }
    meds[index] = { ...meds[index], ...data };
    this.medications.set(patientId, meds);
    return meds[index];
  }

  async delete(patientId: string, id: string): Promise<void> {
    const meds = this.medications.get(patientId) || [];
    const filtered = meds.filter((m) => m.id !== id);
    this.medications.set(patientId, filtered);
  }

  async logMedication(
    patientId: string,
    medicationId: string,
    status: MedicationLog['status'],
  ): Promise<MedicationLog> {
    const id = `log_${Date.now()}`;
    const log: MedicationLog = {
      id,
      medicationId,
      patientId,
      scheduledTime: new Date().toISOString(),
      takenAt: status === 'taken' ? new Date().toISOString() : undefined,
      status,
    };

    const existing = this.logs.get(patientId) || [];
    existing.push(log);
    this.logs.set(patientId, existing);

    return log;
  }

  async getTodaySchedule(patientId: string): Promise<any[]> {
    const meds = await this.findAll(patientId);
    const logs = this.logs.get(patientId) || [];
    const today = new Date().toISOString().split('T')[0];

    const schedule: any[] = [];
    for (const med of meds) {
      if (!med.isActive) continue;
      for (const time of med.times) {
        const todayLog = logs.find(
          (l) => l.medicationId === med.id && l.scheduledTime.startsWith(today),
        );
        schedule.push({
          medicationId: med.id,
          medication: `${med.name} ${med.dosage}`,
          time,
          status: todayLog?.status || 'pending',
        });
      }
    }

    return schedule.sort((a, b) => a.time.localeCompare(b.time));
  }
}
