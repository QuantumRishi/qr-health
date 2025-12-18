import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Service
 *
 * Provides typed Supabase client access for database operations.
 * Uses service role key for admin operations (backend use only).
 *
 * Multi-tenancy is enforced through:
 * 1. Row Level Security (RLS) policies in database
 * 2. Tenant ID filtering in queries
 * 3. User authentication via JWT
 */
@Injectable()
export class SupabaseService implements OnModuleInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private supabase!: SupabaseClient<any, 'public', any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private supabaseAdmin!: SupabaseClient<any, 'public', any>;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASEURL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASEKEY');
    const supabaseServiceKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL and Anon Key must be provided');
    }

    // Client with anon key (respects RLS)
    this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
      },
    });

    // Admin client with service role key (bypasses RLS)
    // Use only for admin operations like creating tenants
    if (supabaseServiceKey) {
      this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    }
  }

  /**
   * Get the Supabase client (respects RLS)
   * Use this for most operations where user context matters
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getClient(): SupabaseClient<any, 'public', any> {
    return this.supabase;
  }

  /**
   * Get the admin Supabase client (bypasses RLS)
   * Use only for admin operations like tenant management
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAdminClient(): SupabaseClient<any, 'public', any> {
    if (!this.supabaseAdmin) {
      throw new Error('Service role key not configured');
    }
    return this.supabaseAdmin;
  }

  /**
   * Get a client with user's JWT token set
   * This allows RLS policies to identify the user
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getClientWithAuth(accessToken: string): SupabaseClient<any, 'public', any> {
    const supabaseUrl = this.configService.get<string>('SUPABASEURL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASEKEY');

    return createClient(supabaseUrl!, supabaseAnonKey!, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
}
