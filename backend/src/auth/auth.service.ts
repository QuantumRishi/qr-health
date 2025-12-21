import { Injectable, UnauthorizedException, Logger, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService, UserResponse } from '../users/users.service';
import { SupabaseService } from '../common/supabase';
import { EmailService } from '../common/email/email.service';
import { RedisOtpService } from '../common/redis/redis-otp.service';

// Interface for tenant query response
interface TenantRow {
  id: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // Default tenant ID for development (in production, this would be resolved from the request)
  private readonly DEFAULT_TENANT_SLUG = 'default';

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private supabase: SupabaseService,
    private emailService: EmailService,
    private redisOtpService: RedisOtpService,
  ) {}

  /**
   * Send OTP to email using Resend
   * Stores OTP in Redis with 5-minute expiration
   */
  async sendOtp(email: string): Promise<{ message: string; success: boolean }> {
    try {
      // Validate email format
      if (!this.isValidEmail(email)) {
        throw new BadRequestException('Invalid email format');
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Store OTP in Redis
      const stored = await this.redisOtpService.storeOtp(email, otp);
      if (!stored) {
        throw new Error('Failed to store OTP');
      }

      // Send OTP via Resend
      const emailResult = await this.emailService.sendOtp(email, otp);

      if (!emailResult.success) {
        this.logger.error(`Failed to send OTP email: ${emailResult.error}`);
        throw new Error('Failed to send OTP email');
      }

      this.logger.log(`OTP sent successfully to ${email}`);
      return { message: 'OTP sent successfully to your email', success: true };
    } catch (error) {
      this.logger.error(`Error sending OTP: ${error}`);
      throw new BadRequestException('Failed to send OTP. Please try again.');
    }
  }

  /**
   * Verify OTP and authenticate user
   */
  async verifyOtp(
    email: string,
    otp: string,
  ): Promise<{ accessToken: string; user: UserResponse }> {
    try {
      // Validate OTP format
      if (!otp || otp.length !== 6) {
        throw new UnauthorizedException('Invalid OTP format');
      }

      // Verify OTP against Redis
      const isValid = await this.redisOtpService.verifyOtp(email, otp);

      if (!isValid) {
        throw new UnauthorizedException('Invalid or expired OTP');
      }

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

        // Send welcome email to new user
        await this.emailService.sendWelcomeEmail(user.email, user.name);
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
    } catch (error) {
      this.logger.error(`Error verifying OTP: ${error}`);
      throw new UnauthorizedException('Authentication failed');
    }
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
      return (existingTenant as TenantRow).id;
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

    return (newTenant as TenantRow).id;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
