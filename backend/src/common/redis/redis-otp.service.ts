import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Redis OTP Service
 *
 * Handles secure OTP storage and retrieval using Redis
 * Provides expiration and cleanup functionality
 * Replaces in-memory storage for production resilience
 */
@Injectable()
export class RedisOtpService {
  private readonly logger = new Logger(RedisOtpService.name);
  private redis: Redis;
  private readonly OTP_PREFIX = 'otp:';
  private readonly OTP_EXPIRY_SECONDS = 5 * 60; // 5 minutes

  constructor(private configService: ConfigService) {
    const redisUrl = this.configService.get<string>(
      'REDIS_URL',
      'redis://localhost:6379',
    );

    this.redis = new Redis(redisUrl);

    this.redis.on('error', (err) => {
      this.logger.error('Redis connection error:', err);
    });

    this.redis.on('connect', () => {
      this.logger.log('Connected to Redis');
    });
  }

  /**
   * Store OTP for email with expiration
   */
  async storeOtp(email: string, otp: string): Promise<boolean> {
    try {
      const key = `${this.OTP_PREFIX}${email}`;
      await this.redis.setex(key, this.OTP_EXPIRY_SECONDS, otp);
      this.logger.debug(`OTP stored for ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to store OTP for ${email}:`, error);
      return false;
    }
  }

  /**
   * Retrieve and verify OTP
   */
  async verifyOtp(email: string, otp: string): Promise<boolean> {
    try {
      const key = `${this.OTP_PREFIX}${email}`;
      const storedOtp = await this.redis.get(key);

      if (!storedOtp) {
        this.logger.warn(`No OTP found or expired for ${email}`);
        return false;
      }

      const isValid = storedOtp === otp;

      if (isValid) {
        // Delete OTP after successful verification
        await this.redis.del(key);
        this.logger.log(`OTP verified and deleted for ${email}`);
      } else {
        this.logger.warn(`Invalid OTP for ${email}`);
      }

      return isValid;
    } catch (error) {
      this.logger.error(`Error verifying OTP for ${email}:`, error);
      return false;
    }
  }

  /**
   * Check if OTP exists (without consuming it)
   */
  async hasOtp(email: string): Promise<boolean> {
    try {
      const key = `${this.OTP_PREFIX}${email}`;
      const exists = await this.redis.exists(key);
      return exists === 1;
    } catch (error) {
      this.logger.error(`Error checking OTP existence for ${email}:`, error);
      return false;
    }
  }

  /**
   * Get remaining TTL for OTP
   */
  async getOtpTtl(email: string): Promise<number> {
    try {
      const key = `${this.OTP_PREFIX}${email}`;
      const ttl = await this.redis.ttl(key);
      return Math.max(0, ttl);
    } catch (error) {
      this.logger.error(`Error getting OTP TTL for ${email}:`, error);
      return 0;
    }
  }

  /**
   * Delete OTP manually
   */
  async deleteOtp(email: string): Promise<boolean> {
    try {
      const key = `${this.OTP_PREFIX}${email}`;
      const result = await this.redis.del(key);
      return result > 0;
    } catch (error) {
      this.logger.error(`Error deleting OTP for ${email}:`, error);
      return false;
    }
  }

  /**
   * Cleanup connection
   */
  async onModuleDestroy() {
    await this.redis.quit();
    this.logger.log('Redis connection closed');
  }
}
