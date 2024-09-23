import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAssigmentDTO } from './dto/createAssignment.dto';
import { AssignmentType } from '@prisma/client';

@Injectable()
export class AssignmentService {
  constructor(private readonly prisma: PrismaService) {}

  async getAssigmentByCourseId(courseId: string) {
    try {
      const assignment = await this.prisma.assignment.findMany({
        where: {
          courseId: courseId,
        },
      });
      return assignment;
    } catch (error) {
      throw new Error('Error Fetch Assignment');
    }
  }

  async createAssignmentByCourseId(
    createAssignmentDTO: CreateAssigmentDTO,
    courseId: string,
  ) {
    try {
      const assignment = await this.prisma.assignment.create({
        data: {
          title: createAssignmentDTO.title,
          description: createAssignmentDTO.description,
          type:
            createAssignmentDTO.type === 'Exercise'
              ? AssignmentType.EXERCISE
              : AssignmentType.EXAM,
          courseId: courseId,
          isLock: false,
        },
      });
      return assignment;
    } catch (error) {
      throw new Error('Error Create Assignment');
    }
  }
}
