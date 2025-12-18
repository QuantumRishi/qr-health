import { Injectable, NotFoundException } from '@nestjs/common';

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
  private familyMembers: Map<string, FamilyMember[]> = new Map();

  async addMember(
    patientId: string,
    data: Partial<FamilyMember>,
  ): Promise<FamilyMember> {
    const id = `family_${Date.now()}`;
    const member: FamilyMember = {
      id,
      patientId,
      name: data.name || '',
      email: data.email || '',
      relationship: data.relationship || '',
      permissions: data.permissions || {
        canViewProgress: true,
        canViewMedications: false,
        canViewExercises: false,
        canViewMood: true,
        notificationFrequency: 'daily',
      },
      addedAt: new Date().toISOString(),
    };

    const existing = this.familyMembers.get(patientId) || [];
    existing.push(member);
    this.familyMembers.set(patientId, existing);

    return member;
  }

  async getMembers(patientId: string): Promise<FamilyMember[]> {
    return this.familyMembers.get(patientId) || [];
  }

  async updatePermissions(
    patientId: string,
    memberId: string,
    permissions: Partial<FamilyPermissions>,
  ): Promise<FamilyMember> {
    const members = this.familyMembers.get(patientId) || [];
    const index = members.findIndex((m) => m.id === memberId);
    if (index === -1) {
      throw new NotFoundException('Family member not found');
    }
    members[index].permissions = {
      ...members[index].permissions,
      ...permissions,
    };
    this.familyMembers.set(patientId, members);
    return members[index];
  }

  async removeMember(patientId: string, memberId: string): Promise<void> {
    const members = this.familyMembers.get(patientId) || [];
    const filtered = members.filter((m) => m.id !== memberId);
    this.familyMembers.set(patientId, filtered);
  }

  async getPatientProgressForFamily(
    patientId: string,
    memberId: string,
  ): Promise<any> {
    const members = this.familyMembers.get(patientId) || [];
    const member = members.find((m) => m.id === memberId);

    if (!member) {
      throw new NotFoundException('Access denied');
    }

    // Return data based on permissions
    const result: any = {};

    if (member.permissions.canViewProgress) {
      result.recoveryScore = 78;
      result.daysSinceSurgery = 14;
      result.trend = 'improving';
    }

    if (member.permissions.canViewMedications) {
      result.medicationsTaken = true;
    }

    if (member.permissions.canViewExercises) {
      result.exercisesCompleted = true;
    }

    if (member.permissions.canViewMood) {
      result.currentMood = 'good';
    }

    return result;
  }
}
