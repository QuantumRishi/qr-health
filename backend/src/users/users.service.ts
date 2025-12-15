import { Injectable, NotFoundException } from '@nestjs/common';

export type UserRole = 'patient' | 'family_viewer' | 'doctor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  consentGiven: boolean;
  consentDate?: string;
}

@Injectable()
export class UsersService {
  // In-memory user storage (use database in production)
  private users: Map<string, User> = new Map();

  async create(data: {
    email: string;
    name: string;
    role?: UserRole;
    consentGiven?: boolean;
  }): Promise<User> {
    const id = `user_${Date.now()}`;
    const user: User = {
      id,
      email: data.email,
      name: data.name,
      role: data.role || 'patient',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      consentGiven: data.consentGiven || false,
      consentDate: data.consentGiven ? new Date().toISOString() : undefined,
    };
    this.users.set(id, user);
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.email === email);
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const updated = { ...user, ...data, updatedAt: new Date().toISOString() };
    this.users.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    if (!this.users.has(id)) {
      throw new NotFoundException('User not found');
    }
    this.users.delete(id);
  }

  async updateConsent(id: string, consentGiven: boolean): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.consentGiven = consentGiven;
    user.consentDate = consentGiven ? new Date().toISOString() : undefined;
    user.updatedAt = new Date().toISOString();
    this.users.set(id, user);
    return user;
  }
}
