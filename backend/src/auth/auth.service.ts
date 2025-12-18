import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService, UserResponse } from '../users/users.service';
import { SupabaseService } from '../common/supabase';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // In-memory OTP storage (use Redis in production)
  private otpStore: Map<string, { otp: string; expiresAt: Date }> = new Map();

  // Default tenant ID for development (in production, this would be resolved from the request)
  private readonly DEFAULT_TENANT_SLUG = 'default';

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private supabase: SupabaseService,
  ) {}

  sendOtp(email: string): { message: string } {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with 5 minute expiry
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    this.otpStore.set(email, { otp, expiresAt });

    // In production, send OTP via email/SMS
    // For demo, we'll just log it
    this.logger.log(`OTP for ${email}: ${otp}`);

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(
    email: string,
    otp: string,
  ): Promise<{ accessToken: string; user: UserResponse }> {
    const storedOtp = this.otpStore.get(email);

    // For demo purposes, accept any OTP
    // In production, validate against stored OTP
    if (!storedOtp || (storedOtp.otp !== otp && otp !== '123456')) {
      // Accept 123456 as demo OTP
      if (otp !== '123456') {
        throw new UnauthorizedException('Invalid or expired OTP');
      }
    }

    if (storedOtp && storedOtp.expiresAt < new Date() && otp !== '123456') {
      this.otpStore.delete(email);
      throw new UnauthorizedException('OTP expired');
    }

    // Clean up OTP
    this.otpStore.delete(email);

    // Get or create tenant
    const tenantId = await this.getOrCreateDefaultTenant();

    // Get or create user
    let user = await this.usersService.findByEmail(email);
    if (!user) {
      user = await this.usersService.create({
        email,
        name: email.split('@')[0],
        role: 'patient',
        tenantId,
      });
    }

    // Generate JWT
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, user };
  }

  async validateUser(userId: string): Promise<UserResponse | undefined> {
    return this.usersService.findById(userId);
  }

  async register(data: {
    email: string;
    name: string;
    consentDataProcessing: boolean;
    consentNotifications?: boolean;
  }): Promise<{ accessToken: string; user: UserResponse }> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(data.email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    // Get or create tenant
    const tenantId = await this.getOrCreateDefaultTenant();

    // Create new user
    const user = await this.usersService.create({
      email: data.email,
      name: data.name,
      role: 'patient',
      consentGiven: data.consentDataProcessing,
      tenantId,
    });

    // Generate JWT
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, user };
  }

  /**
   * Get or create the default tenant for development
   */
  private async getOrCreateDefaultTenant(): Promise<string> {
    const client = this.supabase.getAdminClient();

    // Try to find existing default tenant
    const { data: existingTenant } = await client
      .from('tenants')
      .select('id')
      .eq('slug', this.DEFAULT_TENANT_SLUG)
      .single();

    if (existingTenant) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      return existingTenant.id;
    }

    // Create default tenant
    const { data: newTenant, error } = await client
      .from('tenants')
      .insert({
        name: 'Default Organization',
        slug: this.DEFAULT_TENANT_SLUG,
        email: 'admin@qr-health.app',
        subscription_tier: 'free',
        subscription_status: 'trial',
        trial_ends_at: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      })
      .select()
      .single();

    if (error || !newTenant) {
      this.logger.error('Failed to create default tenant', error);
      throw new Error('Failed to initialize application');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return newTenant.id;
  }
}
