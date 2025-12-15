import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to QR-Health API - Recovery Companion Backend';
  }
}
