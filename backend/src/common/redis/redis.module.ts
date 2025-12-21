import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisOtpService } from './redis-otp.service';

@Module({
  imports: [ConfigModule],
  providers: [RedisOtpService],
  exports: [RedisOtpService],
})
export class RedisModule {}
