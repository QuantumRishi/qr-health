import { Injectable } from '@nestjs/common';

export interface RecoveryProgress {
  id: string;
  patientId: string;
  date: string;
  dayCount: number;
  medicineAdherence: number;
  exerciseConsistency: number;
  painScore: number;
  swellingStatus: 'none' | 'mild' | 'moderate' | 'severe';
  mood: 'great' | 'good' | 'ok' | 'pain' | 'struggling';
  recoveryScore: number;
  trend: 'improving' | 'stable' | 'warning';
  notes?: string;
}

@Injectable()
export class RecoveryService {
  // In-memory storage (use database in production)
  private progress: Map<string, RecoveryProgress[]> = new Map();

  async logProgress(
    patientId: string,
    data: Partial<RecoveryProgress>,
  ): Promise<RecoveryProgress> {
    const id = `progress_${Date.now()}`;
    const progress: RecoveryProgress = {
      id,
      patientId,
      date: new Date().toISOString().split('T')[0],
      dayCount: data.dayCount || 1,
      medicineAdherence: data.medicineAdherence || 0,
      exerciseConsistency: data.exerciseConsistency || 0,
      painScore: data.painScore || 5,
      swellingStatus: data.swellingStatus || 'mild',
      mood: data.mood || 'ok',
      recoveryScore: this.calculateRecoveryScore(data),
      trend: 'stable',
      notes: data.notes,
    };

    const existing = this.progress.get(patientId) || [];
    existing.push(progress);
    this.progress.set(patientId, existing);

    return progress;
  }

  async getProgress(patientId: string): Promise<RecoveryProgress[]> {
    return this.progress.get(patientId) || [];
  }

  async getLatestProgress(
    patientId: string,
  ): Promise<RecoveryProgress | undefined> {
    const all = this.progress.get(patientId) || [];
    return all[all.length - 1];
  }

  async getDashboardStats(patientId: string) {
    const latest = await this.getLatestProgress(patientId);
    const history = await this.getProgress(patientId);

    return {
      daysSinceSurgery: latest?.dayCount || 0,
      recoveryScore: latest?.recoveryScore || 0,
      recoveryTrend: latest?.trend || 'stable',
      weeklyProgress: {
        medicineAdherence: this.calculateWeeklyAverage(
          history,
          'medicineAdherence',
        ),
        exerciseConsistency: this.calculateWeeklyAverage(
          history,
          'exerciseConsistency',
        ),
        averagePainScore: this.calculateWeeklyAverage(history, 'painScore'),
      },
    };
  }

  private calculateRecoveryScore(data: Partial<RecoveryProgress>): number {
    // Simple scoring algorithm
    let score = 50;

    if (data.medicineAdherence) score += (data.medicineAdherence - 50) * 0.3;
    if (data.exerciseConsistency)
      score += (data.exerciseConsistency - 50) * 0.2;
    if (data.painScore) score -= (data.painScore - 5) * 2;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private calculateWeeklyAverage(
    history: RecoveryProgress[],
    field: keyof RecoveryProgress,
  ): number {
    const last7Days = history.slice(-7);
    if (last7Days.length === 0) return 0;

    const sum = last7Days.reduce((acc, p) => acc + (Number(p[field]) || 0), 0);
    return Math.round(sum / last7Days.length);
  }
}
