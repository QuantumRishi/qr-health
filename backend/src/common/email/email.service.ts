import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

/**
 * Email Service
 *
 * Handles all email communication using Resend email provider
 * Supports OTP emails, welcome emails, and recovery notifications
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private fromEmail: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.get<string>(
      'RESEND_FROM_EMAIL',
      'noreply@resend.dev',
    );

    if (!apiKey) {
      this.logger.warn(
        'RESEND_API_KEY not configured. Email service will not work.',
      );
    }

    this.resend = new Resend(apiKey);
  }

  /**
   * Send OTP via email
   */
  async sendOtp(email: string, otp: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Your QR-Health Login Code',
        html: this.getOtpEmailTemplate(otp, email),
      });

      if (response.error) {
        this.logger.error(`Failed to send OTP to ${email}:`, response.error);
        return { success: false, error: response.error.message };
      }

      this.logger.log(`OTP email sent successfully to ${email}`);
      return { success: true, messageId: response.data?.id };
    } catch (error) {
      this.logger.error(`Error sending OTP email to ${email}:`, error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(
    email: string,
    userName: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Welcome to QR-Health - Your Recovery Companion',
        html: this.getWelcomeEmailTemplate(userName),
      });

      if (response.error) {
        this.logger.error(`Failed to send welcome email to ${email}:`, response.error);
        return { success: false, error: response.error.message };
      }

      this.logger.log(`Welcome email sent successfully to ${email}`);
      return { success: true, messageId: response.data?.id };
    } catch (error) {
      this.logger.error(`Error sending welcome email to ${email}:`, error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Send milestone notification email
   */
  async sendMilestoneEmail(
    email: string,
    userName: string,
    milestone: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: `🎉 Milestone Achieved on QR-Health: ${milestone}`,
        html: this.getMilestoneEmailTemplate(userName, milestone),
      });

      if (response.error) {
        this.logger.error(`Failed to send milestone email to ${email}:`, response.error);
        return { success: false, error: response.error.message };
      }

      this.logger.log(`Milestone email sent successfully to ${email}`);
      return { success: true, messageId: response.data?.id };
    } catch (error) {
      this.logger.error(`Error sending milestone email to ${email}:`, error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Email template for OTP
   */
  private getOtpEmailTemplate(otp: string, email: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #2563EB; margin: 0; }
            .content { text-align: center; }
            .otp-box { background-color: #2563EB; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; }
            .expires { color: #666; font-size: 14px; margin-top: 10px; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 QR-Health</h1>
              <p>Your Recovery Companion</p>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>We received a request to sign in to your QR-Health account. Use the code below to verify your email:</p>
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              <p class="expires">This code expires in 5 minutes. Do not share this code with anyone.</p>
              <p>If you didn't request this code, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} QR-Health. All rights reserved.</p>
              <p>This is a confidential communication. If you received this by mistake, please delete it.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Email template for welcome
   */
  private getWelcomeEmailTemplate(userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #2563EB; margin: 0; }
            .features { margin: 20px 0; }
            .feature { padding: 10px 0; }
            .feature-icon { font-size: 20px; margin-right: 10px; }
            .cta-button { background-color: #2563EB; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 20px; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 Welcome to QR-Health, ${userName}!</h1>
            </div>
            <div class="content">
              <p>We're excited to have you join our recovery community. QR-Health is designed to help you track your post-surgery recovery journey with confidence.</p>
              <div class="features">
                <div class="feature"><span class="feature-icon">📋</span> Track medications and exercises</div>
                <div class="feature"><span class="feature-icon">📊</span> Monitor your recovery progress</div>
                <div class="feature"><span class="feature-icon">🔔</span> Get timely reminders</div>
                <div class="feature"><span class="feature-icon">👨‍👩‍👧</span> Share progress with family</div>
                <div class="feature"><span class="feature-icon">🤖</span> Chat with our AI assistant</div>
              </div>
              <a href="https://app.qr-health.com" class="cta-button">Get Started</a>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} QR-Health. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Email template for milestone
   */
  private getMilestoneEmailTemplate(userName: string, milestone: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
            .header { text-align: center; margin-bottom: 30px; background: linear-gradient(135deg, #2563EB 0%, #7c3aed 100%); color: white; padding: 20px; border-radius: 8px; }
            .header h1 { margin: 0; font-size: 28px; }
            .celebration { text-align: center; font-size: 40px; margin: 20px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Congratulations, ${userName}!</h1>
            </div>
            <div class="celebration">🏆</div>
            <div class="content">
              <p style="text-align: center; font-size: 18px;">You've achieved: <strong>${milestone}</strong></p>
              <p>This is a significant milestone in your recovery journey. Keep up the excellent progress!</p>
              <p style="text-align: center;">Your dedication to your recovery is inspiring. We're proud of you!</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} QR-Health. Your trusted recovery companion.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
