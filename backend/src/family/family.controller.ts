import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { FamilyService, FamilyMember, FamilyPermissions } from './family.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('family')
@UseGuards(JwtAuthGuard)
export class FamilyController {
  constructor(private familyService: FamilyService) {}

  @Get()
  async getMembers(@Req() req: any) {
    return this.familyService.getMembers(req.user.userId);
  }

  @Post()
  async addMember(@Req() req: any, @Body() data: Partial<FamilyMember>) {
    return this.familyService.addMember(req.user.userId, data);
  }

  @Put(':id/permissions')
  async updatePermissions(
    @Req() req: any,
    @Param('id') id: string,
    @Body() permissions: Partial<FamilyPermissions>,
  ) {
    return this.familyService.updatePermissions(req.user.userId, id, permissions);
  }

  @Delete(':id')
  async removeMember(@Req() req: any, @Param('id') id: string) {
    await this.familyService.removeMember(req.user.userId, id);
    return { message: 'Family member removed' };
  }

  @Get('progress/:patientId')
  async getPatientProgress(@Req() req: any, @Param('patientId') patientId: string) {
    // This endpoint is for family members viewing patient progress
    return this.familyService.getPatientProgressForFamily(patientId, req.user.userId);
  }
}
