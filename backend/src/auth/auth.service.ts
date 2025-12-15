import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  // In-memory OTP storage (use Redis in production)
  private otpStore: Map<string, { otp: string; expiresAt: Date }> = new Map();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async sendOtp(email: string): Promise<{ message: string }> {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with 5 minute expiry
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    this.otpStore.set(email, { otp, expiresAt });

    // In production, send OTP via email/SMS
    // For demo, we'll just log it
    console.log(`OTP for ${email}: ${otp}`);

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(email: string, otp: string): Promise<{ accessToken: string; user: any }> {
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

    // Get or create user
    let user = await this.usersService.findByEmail(email);
    if (!user) {
      user = await this.usersService.create({
        email,
        name: email.split('@')[0],
        role: 'patient',
      });
    }

    // Generate JWT
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, user };
  }

  async validateUser(userId: string): Promise<any> {
    return this.usersService.findById(userId);
  }

  async register(data: {
    email: string;
    name: string;
    consentDataProcessing: boolean;
    consentNotifications?: boolean;
  }): Promise<{ accessToken: string; user: any }> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(data.email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    // Create new user
    const user = await this.usersService.create({
      email: data.email,
      name: data.name,
      role: 'patient',
      consentGiven: data.consentDataProcessing,
    });

    // Generate JWT
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, user };
  }
}
