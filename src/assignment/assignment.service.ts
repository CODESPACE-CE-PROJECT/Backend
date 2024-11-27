import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAssigmentDTO } from './dto/createAssignment.dto';
import { UpdateAssignmentDTO } from './dto/updateAssignment.dto';
import { AnnounceAssignmentType, AssignmentType } from '@prisma/client';

@Injectable()
export class AssignmentService {
  constructor(private readonly prisma: PrismaService) {}

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

  async createAssignmentByCourseId(createAssignmentDTO: CreateAssigmentDTO) {
    try {
      const assignment = await this.prisma.assignment.create({
        data: {
          title: createAssignmentDTO.title,
          type: createAssignmentDTO.type,
          courseId: createAssignmentDTO.courseId,
          isLock: true,
          announceType:
            createAssignmentDTO.type === AssignmentType.EXAMONLINE ||
            AssignmentType.EXAMONSITE
              ? AnnounceAssignmentType.SET
              : AnnounceAssignmentType.UNSET,
          announceDate:
            createAssignmentDTO.type === AssignmentType.EXAMONSITE ||
            AssignmentType.EXAMONLINE
              ? createAssignmentDTO.startAt
              : '',
          startAt: createAssignmentDTO.startAt,
          expireAt: createAssignmentDTO.expireAt,
        },
      });
      return assignment;
    } catch (error) {
      throw new Error('Error Create Assignment');
    }
  }

  async updateAssingmentById(
    updateAssignmentDTO: UpdateAssignmentDTO,
    id: string,
  ) {
    try {
      const assignment = await this.prisma.assignment.update({
        where: {
          assignmentId: id,
        },
        data: {
          title: updateAssignmentDTO.title,
          type: updateAssignmentDTO.type,
          announceType:
            updateAssignmentDTO.type === AssignmentType.EXAMONLINE ||
            AssignmentType.EXAMONSITE
              ? AnnounceAssignmentType.SET
              : AnnounceAssignmentType.UNSET,
          announceDate:
            updateAssignmentDTO.type === AssignmentType.EXAMONSITE ||
            AssignmentType.EXAMONLINE
              ? updateAssignmentDTO.startAt
              : '',
          startAt: updateAssignmentDTO.startAt,
          expireAt: updateAssignmentDTO.expireAt,
        },
      });
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

  async deleteAssignmentById(id: string) {
    try {
      const assignment = await this.prisma.assignment.delete({
        where: {
          assignmentId: id,
        },
      });
      return assignment;
    } catch (error) {
      throw new Error('Error Delete Assignment');
    }
  }
}
