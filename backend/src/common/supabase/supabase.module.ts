import { Module, Global } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

/**
 * Supabase Module
 *
 * Global module that provides Supabase client access throughout the application.
 *
 * Usage in other modules:
 * 1. No need to import - it's global
 * 2. Inject SupabaseService in your service constructor
 *
 * Example:
 * ```typescript
 * @Injectable()
 * export class MyService {
 *   constructor(private supabase: SupabaseService) {}
 *
 *   async getData() {
 *     const client = this.supabase.getClient();
 *     const { data, error } = await client.from('my_table').select('*');
 *     return data;
 *   }
 * }
 * ```
 */
@Global()
@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
