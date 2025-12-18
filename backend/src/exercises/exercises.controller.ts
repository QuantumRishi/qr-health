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
import { ExercisesService, Exercise, ExerciseLog } from './exercises.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('exercises')
@UseGuards(JwtAuthGuard)
export class ExercisesController {
  constructor(private exercisesService: ExercisesService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.exercisesService.findAll(req.user.userId);
  }

  @Get('schedule/today')
  async getTodaySchedule(@Req() req: any) {
    return this.exercisesService.getTodaySchedule(req.user.userId);
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.exercisesService.findOne(req.user.userId, id);
  }

  @Post()
  async create(@Req() req: any, @Body() data: Partial<Exercise>) {
    return this.exercisesService.create(req.user.userId, data);
  }

  @Put(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() data: Partial<Exercise>,
  ) {
    return this.exercisesService.update(req.user.userId, id, data);
  }

  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    await this.exercisesService.delete(req.user.userId, id);
    return { message: 'Exercise deleted' };
  }

  @Post(':id/log')
  async logExercise(
    @Req() req: any,
    @Param('id') id: string,
    @Body()
    data: { status: ExerciseLog['status']; painLevel?: number; notes?: string },
  ) {
    return this.exercisesService.logExercise(req.user.userId, id, data);
  }
}
