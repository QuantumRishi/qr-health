import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MedicationsService, Medication } from './medications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('medications')
@UseGuards(JwtAuthGuard)
export class MedicationsController {
  constructor(private medicationsService: MedicationsService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.medicationsService.findAll(req.user.userId);
  }

  @Get('schedule/today')
  async getTodaySchedule(@Req() req: any) {
    return this.medicationsService.getTodaySchedule(req.user.userId);
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.medicationsService.findOne(req.user.userId, id);
  }

  @Post()
  async create(@Req() req: any, @Body() data: Partial<Medication>) {
    return this.medicationsService.create(req.user.userId, data);
  }

  @Put(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() data: Partial<Medication>,
  ) {
    return this.medicationsService.update(req.user.userId, id, data);
  }

  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    await this.medicationsService.delete(req.user.userId, id);
    return { message: 'Medication deleted' };
  }

  @Post(':id/log')
  async logMedication(
    @Req() req: any,
    @Param('id') id: string,
    @Body() data: { status: 'taken' | 'missed' | 'skipped' },
  ) {
    return this.medicationsService.logMedication(
      req.user.userId,
      id,
      data.status,
    );
  }
}
