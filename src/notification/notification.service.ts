import { Injectable } from '@nestjs/common';
import { NotificationType, Role } from '@prisma/client';
import { IRequest } from 'src/auth/interface/request.interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllNotification() {
    try {
      const notification = await this.prisma.notification.findMany({
        include: {
          course: {
            select: {
              courseId: true,
              title: true,
            },
          },
          user: {
            omit: {
              hashedPassword: true,
            },
          },
        },
        omit: {
          username: true,
          courseId: true,
        },
      });
      return notification;
    } catch (error) {
      throw new Error('Error Fetch All Notification');
    }
  }

  async getNotificationById(id: string) {
    try {
      const notification = await this.prisma.notification.findFirst({
        where: {
          notificationId: id,
        },
      });
      return notification;
    } catch (error) {
      throw new Error('Error Fetch Notificaion By Id');
    }
  }

  async getNotificationByUsername(req: IRequest) {
    try {
      const { username, role } = req.user;

      const orConditions: any[] = [];

      if (role === Role.TEACHER) {
        orConditions.push({
          AND: [
            {
              NOT: {
                closedBy: {
                  some: { username: username },
                },
              },
            },
            {
              course: {
                courseTeacher: {
                  some: { username },
                },
              },
            },
          ],
        });
      } else {
        orConditions.push({
          AND: [
            {
              type: {
                in: [NotificationType.GENERAL, NotificationType.ANNOUNCE],
              },
            },
            {
              NOT: {
                closedBy: {
                  some: { username: username },
                },
              },
            },
            {
              course: {
                courseStudent: {
                  some: { username },
                },
              },
            },
          ],
        });
      }

      const notifications = await this.prisma.notification.findMany({
        where: {
          OR: orConditions,
        },
        include: {
          course: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              pictureUrl: true,
            },
          },
        },
      });

      return notifications;
    } catch (error) {
      console.log(error);
      throw new Error('Error Fetching Notifications');
    }
  }

  async createNotification(
    username: string,
    courseId: string,
    type: NotificationType,
    detail: string,
  ) {
    try {
      await this.prisma.notification.create({
        data: {
          username: username,
          courseId: courseId,
          type: type,
          detail: detail,
        },
      });
    } catch (error) {
      throw new Error('Error Create Notification');
    }
  }

  async updateNotification(
    courseId: string,
    oldDetail: string,
    detail: string,
  ) {
    try {
      await this.prisma.notification.updateMany({
        where: {
          courseId: courseId,
          detail: oldDetail,
        },
        data: {
          detail: detail,
        },
      });
    } catch (error) {
      throw new Error('Error Update Notification');
    }
  }

  async createUserNotification(username: string, notificationId: string) {
    try {
      const userNotification = await this.prisma.userNotification.create({
        data: {
          username: username,
          notificationId: notificationId,
          isClose: true,
        },
      });

      return userNotification;
    } catch (error) {
      console.log(error);
      throw new Error('Failed to create UserNotification');
    }
  }
}
