import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getProfile(@Req() req: any) {
    return this.usersService.findById(req.user.userId);
  }

  @Put('me')
  async updateProfile(
    @Req() req: any,
    @Body() data: { name?: string; phone?: string },
  ) {
    return this.usersService.update(req.user.userId, data);
  }

  @Delete('me')
  async deleteAccount(@Req() req: any) {
    await this.usersService.delete(req.user.userId);
    return { message: 'Account deleted successfully' };
  }

  @Put('me/consent')
  async updateConsent(
    @Req() req: any,
    @Body() data: { consentGiven: boolean },
  ) {
    return this.usersService.updateConsent(req.user.userId, data.consentGiven);
  }
}
