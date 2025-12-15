import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { RemindersService, Reminder } from './reminders.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('reminders')
@UseGuards(JwtAuthGuard)
export class RemindersController {
  constructor(private remindersService: RemindersService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.remindersService.findAll(req.user.userId);
  }

  @Get('upcoming')
  async getUpcoming(@Req() req: any) {
    return this.remindersService.getUpcoming(req.user.userId);
  }

  @Post()
  async create(@Req() req: any, @Body() data: Partial<Reminder>) {
    return this.remindersService.create(req.user.userId, data);
  }

  @Post(':id/toggle')
  async toggle(@Req() req: any, @Param('id') id: string) {
    return this.remindersService.toggle(req.user.userId, id);
  }

  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    await this.remindersService.delete(req.user.userId, id);
    return { message: 'Reminder deleted' };
  }
}
