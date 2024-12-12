import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Request,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { UtilsService } from 'src/utils/utils.service';
import { IRequest } from 'src/auth/interface/request.interface';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiBearerAuth()
@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly utilsService: UtilsService,
  ) {}

  @ApiOperation({ summary: 'Get Dashboard Info (Admin)' })
  @UseGuards(JwtAuthGuard)
  @Get()
  async getInfoDashboard(@Request() req: IRequest) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.ADMIN,
    ]);
    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }

    const dashboard = await this.dashboardService.getInfoDashboard();
    return {
      message: 'Successfully Get Dashboard Info',
      data: dashboard,
    };
  }
}
