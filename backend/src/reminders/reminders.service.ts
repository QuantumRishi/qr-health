import { Injectable } from '@nestjs/common';

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
  private reminders: Map<string, Reminder[]> = new Map();

  async create(patientId: string, data: Partial<Reminder>): Promise<Reminder> {
    const id = `reminder_${Date.now()}`;
    const reminder: Reminder = {
      id,
      patientId,
      type: data.type || 'custom',
      title: data.title || '',
      message: data.message || '',
      scheduledTime: data.scheduledTime || '',
      recurring: data.recurring || false,
      isActive: true,
    };

    const existing = this.reminders.get(patientId) || [];
    existing.push(reminder);
    this.reminders.set(patientId, existing);

    return reminder;
  }

  async findAll(patientId: string): Promise<Reminder[]> {
    return this.reminders.get(patientId) || [];
  }

  async getUpcoming(patientId: string): Promise<Reminder[]> {
    const all = await this.findAll(patientId);
    const now = new Date().toISOString();
    return all
      .filter((r) => r.isActive && r.scheduledTime >= now)
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))
      .slice(0, 5);
  }

  async delete(patientId: string, id: string): Promise<void> {
    const reminders = this.reminders.get(patientId) || [];
    const filtered = reminders.filter((r) => r.id !== id);
    this.reminders.set(patientId, filtered);
  }

  async toggle(patientId: string, id: string): Promise<Reminder> {
    const reminders = this.reminders.get(patientId) || [];
    const index = reminders.findIndex((r) => r.id === id);
    if (index !== -1) {
      reminders[index].isActive = !reminders[index].isActive;
      this.reminders.set(patientId, reminders);
      return reminders[index];
    }
    throw new Error('Reminder not found');
  }
}
