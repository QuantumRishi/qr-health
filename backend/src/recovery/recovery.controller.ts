import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { RecoveryService, RecoveryProgress } from './recovery.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('recovery')
@UseGuards(JwtAuthGuard)
export class RecoveryController {
  constructor(private recoveryService: RecoveryService) {}

  @Get()
  async getProgress(@Req() req: any) {
    return this.recoveryService.getProgress(req.user.userId);
  }

  @Get('latest')
  async getLatestProgress(@Req() req: any) {
    return this.recoveryService.getLatestProgress(req.user.userId);
  }

  @Get('dashboard')
  async getDashboardStats(@Req() req: any) {
    return this.recoveryService.getDashboardStats(req.user.userId);
  }

  @Post()
  async logProgress(@Req() req: any, @Body() data: Partial<RecoveryProgress>) {
    return this.recoveryService.logProgress(req.user.userId, data);
  }
}
