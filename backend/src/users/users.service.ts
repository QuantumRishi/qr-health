import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { SupabaseService } from '../common/supabase';
import { User, UserRole, ConsentRecord, PatientProfile } from '../types';

/**
 * Response type for user operations (simplified for API responses)
 */
export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  consentGiven: boolean;
  consentDate?: string;
  tenantId: string;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private supabase: SupabaseService) {}

  /**
   * Create a new user in Supabase
   * Note: This creates the user record in our users table.
   * The auth user should be created via Supabase Auth first.
   */
  async create(data: {
    id?: string; // Supabase Auth user ID
    email: string;
    name: string;
    role?: UserRole;
    consentGiven?: boolean;
    tenantId: string;
  }): Promise<UserResponse> {
    const client = this.supabase.getAdminClient();

    // Create user record
    const { data: user, error: userError } = await client
      .from('users')
      .insert({
        id: data.id,
        tenant_id: data.tenantId,
        email: data.email,
        name: data.name,
        role: data.role || 'patient',
        is_active: true,
        notification_preferences: { push: true, email: true, sms: false },
      })
      .select()
      .single();

    if (userError) {
      this.logger.error('Failed to create user', userError);
      throw new Error(`Failed to create user: ${userError.message}`);
    }

    // Create consent record if consent given
    if (data.consentGiven) {
      const { error: consentError } = await client
        .from('consent_records')
        .insert({
          user_id: user.id,
          tenant_id: data.tenantId,
          consent_type: 'data_processing',
          is_granted: true,
          granted_at: new Date().toISOString(),
          consent_version: '1.0',
        });

      if (consentError) {
        this.logger.warn('Failed to create consent record', consentError);
      }
    }

    return this.mapToUserResponse(user, data.consentGiven);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserResponse | undefined> {
    const client = this.supabase.getAdminClient();

    const { data: user, error } = await client
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return undefined;
    }

    // Get consent status
    const consent = await this.getConsentStatus(user.id);
    return this.mapToUserResponse(user, consent);
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<UserResponse | undefined> {
    const client = this.supabase.getAdminClient();

    const { data: user, error } = await client
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return undefined;
    }

    const consent = await this.getConsentStatus(user.id);
    return this.mapToUserResponse(user, consent);
  }

  /**
   * Update user
   */
  async update(id: string, data: Partial<UserResponse>): Promise<UserResponse> {
    const client = this.supabase.getAdminClient();

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.role !== undefined) updateData.role = data.role;

    const { data: user, error } = await client
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !user) {
      throw new NotFoundException('User not found');
    }

    const consent = await this.getConsentStatus(user.id);
    return this.mapToUserResponse(user, consent);
  }

  /**
   * Soft delete user
   */
  async delete(id: string): Promise<void> {
    const client = this.supabase.getAdminClient();

    const { error } = await client
      .from('users')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new NotFoundException('User not found');
    }
  }

  /**
   * Update consent status
   */
  async updateConsent(
    id: string,
    consentGiven: boolean,
    consentType: string = 'data_processing',
  ): Promise<UserResponse> {
    const client = this.supabase.getAdminClient();

    // Get user first
    const { data: user, error: userError } = await client
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (userError || !user) {
      throw new NotFoundException('User not found');
    }

    // Update or create consent record
    if (consentGiven) {
      const { error } = await client.from('consent_records').upsert(
        {
          user_id: id,
          tenant_id: user.tenant_id,
          consent_type: consentType,
          is_granted: true,
          granted_at: new Date().toISOString(),
          consent_version: '1.0',
        },
        {
          onConflict: 'user_id,consent_type,consent_version',
        },
      );

      if (error) {
        this.logger.error('Failed to update consent', error);
      }
    } else {
      // Revoke consent
      const { error } = await client
        .from('consent_records')
        .update({
          is_granted: false,
          revoked_at: new Date().toISOString(),
        })
        .eq('user_id', id)
        .eq('consent_type', consentType);

      if (error) {
        this.logger.error('Failed to revoke consent', error);
      }
    }

    return this.mapToUserResponse(user, consentGiven);
  }

  /**
   * Get patient profile for a user
   */
  async getPatientProfile(userId: string): Promise<PatientProfile | null> {
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

  /**
   * Create or update patient profile
   */
  async upsertPatientProfile(
    userId: string,
    tenantId: string,
    data: Partial<PatientProfile>,
  ): Promise<PatientProfile> {
    const client = this.supabase.getAdminClient();

    const { data: profile, error } = await client
      .from('patient_profiles')
      .upsert(
        {
          user_id: userId,
          tenant_id: tenantId,
          ...data,
        },
        {
          onConflict: 'user_id',
        },
      )
      .select()
      .single();

    if (error) {
      this.logger.error('Failed to upsert patient profile', error);
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return profile as PatientProfile;
  }

  /**
   * Get consent status for a user
   */
  private async getConsentStatus(userId: string): Promise<boolean> {
    const client = this.supabase.getAdminClient();

    const { data, error } = await client
      .from('consent_records')
      .select('is_granted, granted_at')
      .eq('user_id', userId)
      .eq('consent_type', 'data_processing')
      .eq('is_granted', true)
      .single();

    return !error && data?.is_granted === true;
  }

  /**
   * Map database user to API response
   */
  private mapToUserResponse(user: User, consentGiven?: boolean): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name || '',
      role: user.role,
      phone: user.phone,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      consentGiven: consentGiven ?? false,
      tenantId: user.tenant_id,
    };
  }
}
