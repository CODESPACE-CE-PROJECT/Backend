import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { IRequest } from 'src/auth/interface/request.interface';

@ApiBearerAuth()
@ApiTags('Notification')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOperation({
    summary: 'Get Notification By Username Yourself (Admin, Teacher)',
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  async getNotification(@Request() req: IRequest) {
    const notification =
      await this.notificationService.getNotificationByUsername(req);
    return {
      message: 'Successfully Get Dashboard Info',
      data: notification,
    };
  }

  @ApiOperation({
    summary: 'Create User Notification by Notification Id (Teacher, Student)',
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async createUserNotification(
    @Request() req: IRequest,
    @Param('id') id: string,
  ) {
    const validNotification =
      await this.notificationService.getNotificationById(id);
    if (!validNotification) {
      throw new HttpException('Notification Not Found', HttpStatus.NOT_FOUND);
    }
    const userNotification =
      await this.notificationService.createUserNotification(
        req.user.username,
        id,
      );

    return {
      message: 'User Notification Created Successfully',
      data: userNotification,
    };
  }
}
