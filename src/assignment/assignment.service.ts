import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAssigmentDTO } from './dto/createAssignment.dto';
import { AssignmentType } from '@prisma/client';
import { UpdateAssignmentDTO } from './dto/updateAssignment.dto';
import { AddDateAssignmentDTO } from './dto/addDateAssignment.dto';
import { UpdateLockAssignmentDTO } from './dto/updateLOckAssignment.dto';

@Injectable()
export class AssignmentService {
  constructor(private readonly prisma: PrismaService) {}

  async getAssigmentById(id: string) {
    try {
      const assignment = await this.prisma.assignment.findUnique({
        where: {
          assignmentId: id,
        },
      });
      return assignment;
    } catch (error) {
      throw new Error('Error Fetch Assignment');
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
          description: createAssignmentDTO.description,
          type:
            createAssignmentDTO.type === 'Exercise'
              ? AssignmentType.EXERCISE
              : AssignmentType.EXAM,
          courseId: createAssignmentDTO.courseId,
          isLock: false,
          language: createAssignmentDTO.language,
          problemQuantities: createAssignmentDTO.problemQuantities,
        },
      });
      return assignment;
    } catch (error) {
      throw new Error('Error Create Assignment');
    }
  }

  async countAssignment(courseId: string) {
    try {
      const count = await this.prisma.assignment.count({
        where: {
          courseId: courseId,
        },
      });
      return count;
    } catch (error) {
      throw new Error('Error Get Count Assignment');
    }
  }

  async addDateAssignmentById(
    addDateAssignmentDTO: AddDateAssignmentDTO,
    id: string,
  ) {
    try {
      const assignment = await this.prisma.assignment.update({
        where: {
          assignmentId: id,
        },
        data: {
          startAt: addDateAssignmentDTO.startAt,
          expireAt: addDateAssignmentDTO.expireAt,
        },
      });
      return assignment;
    } catch (error) {
      throw new Error('Error Add Date Assignment');
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
          description: updateAssignmentDTO.description,
          type:
            updateAssignmentDTO.type === 'Exercise'
              ? AssignmentType.EXERCISE
              : AssignmentType.EXAM,
          language: updateAssignmentDTO.language,
          problemQuantities: updateAssignmentDTO.problemQuantities,
        },
      });
      return assignment;
    } catch (error) {
      throw new Error('Error Update Assignment');
    }
  }

  async updateLockAssignmentById(
    updateLockAssignmentDTO: UpdateLockAssignmentDTO,
    id: string,
  ) {
    try {
      const assignment = await this.prisma.assignment.update({
        where: {
          assignmentId: id,
        },
        data: {
          isLock: updateLockAssignmentDTO.isLock,
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
