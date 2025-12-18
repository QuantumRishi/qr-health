import { Injectable, NotFoundException } from '@nestjs/common';

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
  private exercises: Map<string, Exercise[]> = new Map();
  private logs: Map<string, ExerciseLog[]> = new Map();

  async create(patientId: string, data: Partial<Exercise>): Promise<Exercise> {
    const id = `ex_${Date.now()}`;
    const exercise: Exercise = {
      id,
      patientId,
      name: data.name || '',
      description: data.description || '',
      duration: data.duration || 5,
      frequency: data.frequency || 'daily',
      scheduledDays: data.scheduledDays || [0, 1, 2, 3, 4, 5, 6],
      instructions: data.instructions || [],
      isActive: true,
    };

    const existing = this.exercises.get(patientId) || [];
    existing.push(exercise);
    this.exercises.set(patientId, existing);

    return exercise;
  }

  async findAll(patientId: string): Promise<Exercise[]> {
    return this.exercises.get(patientId) || [];
  }

  async findOne(patientId: string, id: string): Promise<Exercise | undefined> {
    const exercises = this.exercises.get(patientId) || [];
    return exercises.find((e) => e.id === id);
  }

  async update(
    patientId: string,
    id: string,
    data: Partial<Exercise>,
  ): Promise<Exercise> {
    const exercises = this.exercises.get(patientId) || [];
    const index = exercises.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new NotFoundException('Exercise not found');
    }
    exercises[index] = { ...exercises[index], ...data };
    this.exercises.set(patientId, exercises);
    return exercises[index];
  }

  async delete(patientId: string, id: string): Promise<void> {
    const exercises = this.exercises.get(patientId) || [];
    const filtered = exercises.filter((e) => e.id !== id);
    this.exercises.set(patientId, filtered);
  }

  async logExercise(
    patientId: string,
    exerciseId: string,
    data: { status: ExerciseLog['status']; painLevel?: number; notes?: string },
  ): Promise<ExerciseLog> {
    const id = `log_${Date.now()}`;
    const log: ExerciseLog = {
      id,
      exerciseId,
      patientId,
      scheduledDate: new Date().toISOString().split('T')[0],
      completedAt:
        data.status === 'completed' ? new Date().toISOString() : undefined,
      status: data.status,
      painLevel: data.painLevel,
      notes: data.notes,
    };

    const existing = this.logs.get(patientId) || [];
    existing.push(log);
    this.logs.set(patientId, existing);

    return log;
  }

  async getTodaySchedule(patientId: string): Promise<any[]> {
    const exercises = await this.findAll(patientId);
    const logs = this.logs.get(patientId) || [];
    const today = new Date().toISOString().split('T')[0];
    const dayOfWeek = new Date().getDay();

    const schedule: any[] = [];
    for (const ex of exercises) {
      if (!ex.isActive) continue;
      if (!ex.scheduledDays.includes(dayOfWeek)) continue;

      const todayLog = logs.find(
        (l) => l.exerciseId === ex.id && l.scheduledDate === today,
      );
      schedule.push({
        exerciseId: ex.id,
        exercise: ex.name,
        duration: ex.duration,
        status: todayLog?.status || 'pending',
      });
    }

    return schedule;
  }
}
