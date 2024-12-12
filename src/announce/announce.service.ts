import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAnnounceDTO } from './dto/createAnnounce.dto';
import { UpdateAnnounceDTO } from './dto/updateAnnounce.dto';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class AnnounceService {
  constructor(
    private readonly prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async getAnnouceById(id: string) {
    try {
      const announce = await this.prisma.courseAnnounce.findFirst({
        where: {
          courseAnnounceId: id,
        },
        include: {
          course: {
            include: {
              courseTeacher: true,
              courseStudent: true,
            },
          },
          replyAnnounce: true,
        },
      });
      return announce;
    } catch (error) {
      throw new Error('Error Fetch Announce');
    }
  }

  async createAnnounceByCourseId(
    createAnnounceDTO: CreateAnnounceDTO,
    username: string,
  ) {
    try {
      const announce = await this.prisma.courseAnnounce.create({
        data: {
          courseId: createAnnounceDTO.courseId,
          description: createAnnounceDTO.description,
          username: username,
        },
      });
      await this.notificationService.createNotification(
        username,
        createAnnounceDTO.courseId,
        NotificationType.GENERAL,
        createAnnounceDTO.description,
      );
      return announce;
    } catch (error) {
      throw new Error('Error Create Announce');
    }
  }

  async updateAnnounceById(id: string, updateAnnounceDTO: UpdateAnnounceDTO) {
    try {
      const announce = await this.prisma.courseAnnounce.update({
        where: {
          courseAnnounceId: id,
        },
        data: {
          description: updateAnnounceDTO.description,
        },
      });
      return announce;
    } catch (error) {
      throw new Error('Error Update Announce');
    }
  }

  async deleteAnnounceById(id: string) {
    try {
      const announce = await this.prisma.courseAnnounce.delete({
        where: {
          courseAnnounceId: id,
        },
      });
      return announce;
    } catch (error) {
      throw new Error('Error Delete Announce');
    }
  }
}
