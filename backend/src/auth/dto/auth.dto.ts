import { IsEmail, IsString, IsBoolean, IsOptional, Length, MinLength } from 'class-validator';

export class SendOtpDto {
  @IsEmail()
  email: string;
}

export class VerifyOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6)
  otp: string;
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsBoolean()
  consentDataProcessing: boolean;

  @IsBoolean()
  @IsOptional()
  consentNotifications?: boolean;
}
