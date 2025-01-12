import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAssigmentDTO } from './dto/createAssignment.dto';
import { UpdateAssignmentDTO } from './dto/updateAssignment.dto';
import {
  AnnounceAssignmentType,
  NotificationType,
  StateSubmission,
} from '@prisma/client';
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
        orderBy: [
          {
            no: 'desc',
          },
        ],
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

  async getDashboardScoreByCourseId(courseId: string) {
    try {
      const students = await this.prisma.courseStudent.findMany({
        where: {
          courseId: courseId,
        },
      });

      const problems = await this.prisma.problem.findMany({
        where: {
          assignment: {
            courseId: courseId,
          },
        },
      });

      const totalScoreProblem = problems.reduce(
        (sum, problem) => sum + (problem.score || 0),
        0,
      );

      const submission = await this.prisma.submission.findMany({
        where: {
          problem: {
            assignment: {
              courseId: courseId,
            },
          },
          stateSubmission: StateSubmission.PASS,
        },
        include: {
          problem: {
            select: {
              score: true,
            },
          },
        },
      });

      const totalScoreEachUser = students.map((student) => {
        const studentSubmissions = submission.filter(
          (submission) => submission.username === student.username,
        );

        const totalScore = studentSubmissions.reduce(
          (sum, submission) => sum + (submission.problem?.score || 0),
          0,
        );

        return {
          username: student.username,
          totalScore,
        };
      });

      const scores = totalScoreEachUser.map((user) => user.totalScore);
      const maxScore = Math.max(...scores);
      const minScore = Math.min(...scores);
      const averageScore =
        scores.reduce((sum, score) => sum + score, 0) / scores.length;

      const numberOfRanges = 5;

      const rangeSize = Math.ceil(totalScoreProblem / numberOfRanges);

      const scoreRanges: { max: number; min: number }[] = [];
      for (let i = 0; i < numberOfRanges; i++) {
        const min = i * rangeSize + 1;
        const max = (i + 1) * rangeSize;
        scoreRanges.push({ min: i === 0 ? 0 : min, max });
      }

      const scoreFrequencyByRange = scoreRanges.map((range) => ({
        range: `${range.min}-${range.max}`,
        count: 0,
      }));

      totalScoreEachUser.forEach((user) => {
        const score = user.totalScore;

        const rangeIndex = scoreRanges.findIndex(
          (range) => score >= range.min && score <= range.max,
        );

        if (rangeIndex !== -1) {
          scoreFrequencyByRange[rangeIndex].count += 1;
        }
      });
      return {
        maxScore,
        minScore,
        averageScore,
        totalStudent: students.length,
        range: scoreFrequencyByRange,
      };
    } catch (error) {
      throw new Error('Failed to fetch dashboard scores');
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

  @Cron('*/5 * * * * *') // Runs every 5 seconds
  async handleCourseLock() {
    try {
      const currentDate = new Date();

      // Fetch only relevant assignments
      const assignments = await this.prisma.assignment.findMany({
        where: {
          OR: [
            {
              isLock: true,
              startAt: { lte: currentDate },
              expireAt: { gt: currentDate },
            },
            {
              isLock: false,
              expireAt: { lte: currentDate },
            },
            {
              announceType: { not: AnnounceAssignmentType.ANNOUNCED },
              announceDate: { lte: currentDate },
            },
          ],
        },
      });

      // Process assignments
      for (const assignment of assignments) {
        try {
          // Unlock assignment
          if (
            currentDate >= new Date(assignment.startAt) &&
            currentDate < new Date(assignment.expireAt) &&
            assignment.isLock
          ) {
            await this.prisma.assignment.update({
              where: { assignmentId: assignment.assignmentId },
              data: { isLock: false },
            });
          }

          // Lock assignment
          if (
            currentDate >= new Date(assignment.expireAt) &&
            !assignment.isLock
          ) {
            await this.prisma.assignment.update({
              where: { assignmentId: assignment.assignmentId },
              data: { isLock: true },
            });
          }

          // Announce assignment
          if (
            currentDate >= new Date(assignment.announceDate) &&
            assignment.announceType !== AnnounceAssignmentType.ANNOUNCED
          ) {
            await this.prisma.assignment.update({
              where: { assignmentId: assignment.assignmentId },
              data: { announceType: AnnounceAssignmentType.ANNOUNCED },
            });

            await this.notificationServie.createNotification(
              assignment.username,
              assignment.courseId,
              NotificationType.ANNOUNCE,
              assignment.title,
            );
          }
        } catch (innerError) {
          throw new Error('Erro Inner Cron Job In Assignment');
        }
      }
    } catch (error) {
      throw new Error('Error Cron Job In Assignment');
    }
  }
}
