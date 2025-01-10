import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAssigmentDTO } from './dto/createAssignment.dto';
import { UpdateAssignmentDTO } from './dto/updateAssignment.dto';
import { AnnounceAssignmentType, NotificationType } from '@prisma/client';
import { Cron } from '@nestjs/schedule';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class AssignmentService {
  constructor(
    private readonly prisma: PrismaService,
    private notificationServie: NotificationService,
  ) {}

  async getAssignmentById(id: string) {
    try {
      const assignment = await this.prisma.assignment.findUnique({
        where: {
          assignmentId: id,
        },
        include: {
          course: {
            include: {
              courseTeacher: true,
            },
          },
        },
      });
      return assignment;
    } catch (error) {
      throw new Error('Error Fetch Assignment');
    }
  }

  async getAllAssignmentForCalendar(username: string) {
    try {
      const assignment = await this.prisma.assignment.findMany({
        where: {
          course: {
            OR: [
              {
                courseStudent: {
                  some: {
                    username: username,
                  },
                },
              },
              {
                courseTeacher: {
                  some: {
                    username: username,
                  },
                },
              },
            ],
          },
        },
        select: {
          assignmentId: true,
          title: true,
          startAt: true,
          expireAt: true,
        },
      });

      return assignment;
    } catch (error) {
      throw new Error('Error Fetch Assignment For Calendar');
    }
  }

  async checkTitleExistByCourseId(courseId: string, title: string) {
    try {
      const isExist = await this.prisma.assignment.findFirst({
        where: {
          courseId: courseId,
          title: title,
        },
      });
      return isExist !== null;
    } catch (error) {
      throw new Error('Error Fetch Assignemnt');
    }
  }

  async getManySubmissonByUsernameAndProblemId(
    username: string,
    problemIds: string[],
  ) {
    try {
      const submission = await this.prisma.submission.findMany({
        where: {
          problemId: { in: problemIds },
          username: username,
        },
      });
      return submission;
    } catch (error) {
      throw new Error('Error Fetch Submission');
    }
  }

  async getAssigmentByCourseId(courseId: string) {
    try {
      const assignment = await this.prisma.assignment.findMany({
        where: {
          courseId: courseId,
        },
        include: {
          problem: true,
        },
      });
      return assignment;
    } catch (error) {
      throw new Error('Error Fetch Assignment');
    }
  }

  async createAssignmentByCourseId(
    createAssignmentDTO: CreateAssigmentDTO,
    username: string,
  ) {
    try {
      const assignment = await this.prisma.assignment.create({
        data: {
          username: username,
          title: createAssignmentDTO.title,
          type: createAssignmentDTO.type,
          courseId: createAssignmentDTO.courseId,
          isLock: true,
          announceType: AnnounceAssignmentType.SET,
          announceDate: createAssignmentDTO.announceDate,
          startAt: createAssignmentDTO.startAt,
          expireAt: createAssignmentDTO.expireAt,
        },
      });

      await this.notificationServie.createNotification(
        username,
        assignment.courseId,
        NotificationType.ACTION,
        assignment.title + ' create assignment',
      );

      return assignment;
    } catch (error) {
      throw new Error('Error Create Assignment');
    }
  }

  async updateAssingmentById(
    updateAssignmentDTO: UpdateAssignmentDTO,
    id: string,
    oldTitle: string,
    username: string,
  ) {
    try {
      const assignment = await this.prisma.assignment.update({
        where: {
          assignmentId: id,
        },
        data: {
          title: updateAssignmentDTO.title,
          type: updateAssignmentDTO.type,
          announceDate: updateAssignmentDTO.announceDate,
          startAt: updateAssignmentDTO.startAt,
          expireAt: updateAssignmentDTO.expireAt,
        },
      });

      await this.notificationServie.createNotification(
        username,
        assignment.courseId,
        NotificationType.ACTION,
        assignment.title + ' update assignment',
      );

      await this.notificationServie.updateNotification(
        assignment.courseId,
        oldTitle,
        assignment.title,
      );

      return assignment;
    } catch (error) {
      throw new Error('Error Update Assignment');
    }
  }

  async updateLockAssignmentById(lock: boolean, id: string) {
    try {
      const assignment = await this.prisma.assignment.update({
        where: {
          assignmentId: id,
        },
        data: {
          isLock: lock,
        },
      });
      return assignment;
    } catch (error) {
      throw new Error('Error Update Lock Assignment');
    }
  }

  async deleteAssignmentById(id: string, username: string) {
    try {
      const assignment = await this.prisma.assignment.delete({
        where: {
          assignmentId: id,
        },
      });

      await this.notificationServie.createNotification(
        username,
        assignment.courseId,
        NotificationType.ACTION,
        assignment.title + ' delete assignment',
      );
      return assignment;
    } catch (error) {
      throw new Error('Error Delete Assignment');
    }
  }

  @Cron('*/5 * * * * *') // This runs every 5 seconds
  async handleCourseLock() {
    try {
      const assignments = await this.prisma.assignment.findMany({});

      const currentDate = new Date();

      for (const assignment of assignments) {
        if (
          currentDate >= new Date(assignment.startAt) &&
          currentDate < new Date(assignment.expireAt) &&
          assignment.isLock !== false
        ) {
          await this.prisma.assignment.update({
            where: { assignmentId: assignment.assignmentId },
            data: {
              isLock: false, // Unlock the assignment
            },
          });
        }

        if (
          (currentDate >= new Date(assignment.expireAt) !==
            assignment.isLock) !==
          true
        ) {
          await this.prisma.assignment.update({
            where: { assignmentId: assignment.assignmentId },
            data: {
              isLock: true, // Lock the assignment
            },
          });
        }

        if (
          currentDate >= new Date(assignment.announceDate) &&
          assignment.announceType !== AnnounceAssignmentType.ANNOUNCED
        ) {
          await this.prisma.assignment.update({
            where: { assignmentId: assignment.assignmentId },
            data: {
              announceType: AnnounceAssignmentType.ANNOUNCED,
            },
          });

          await this.notificationServie.createNotification(
            assignment.username,
            assignment.courseId,
            NotificationType.ANNOUNCE,
            assignment.title,
          );
        }
      }
    } catch (error) {
      throw new Error('Error In Cron job Assignment');
    }
  }
}
