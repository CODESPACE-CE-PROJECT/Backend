import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProblemDTO } from './dto/createProblemDTO.dto';
import { UpdateProblemDTO } from './dto/updateProblemDTO.dto';

@Injectable()
export class ProblemService {
  constructor(private readonly prisma: PrismaService) {}

  async getProblemById(id: string) {
    try {
      const problem = await this.prisma.problem.findUnique({
        where: {
          problemId: id,
        },
        include: {
          assignment: {
            select: {
              course: {
                select: {
                  courseTeacher: true,
                  courseStudent: true,
                },
              },
            },
          },
          testCases: true,
          constraint: true,
        },
      });
      return problem;
    } catch (error) {
      throw new Error('Error Fetch Problem');
    }
  }

  async getTestCaseAndConstraintByProblemId(id: string) {
    try {
      const testcase = await this.prisma.problem.findFirst({
        where: {
          problemId: id,
        },
        select: {
          testCases: true,
          constraint: true,
        },
      });
      return testcase;
    } catch (error) {
      throw new Error('Error Fetch Test Case');
    }
  }

  async createProblemByAssignmentId(createProblemDTO: CreateProblemDTO) {
    try {
      const problem = await this.prisma.problem.create({
        include: {
          testCases: true,
          constraint: true,
        },
        data: {
          title: createProblemDTO.title,
          description: createProblemDTO.description,
          hint: createProblemDTO.hint,
          revaleCode: createProblemDTO.revaleCode,
          isRegex: createProblemDTO.isRegex,
          assignmentId: createProblemDTO.assignmentId,
          score: createProblemDTO.score,
          testCases: {
            createMany: {
              data: createProblemDTO.testcase,
            },
          },
          constraint: {
            createMany: {
              data: createProblemDTO.constraint,
            },
          },
        },
      });
      return problem;
    } catch (error) {
      throw new Error('Error Create Problem');
    }
  }

  async updateProblemById(id: string, updateProblemDTO: UpdateProblemDTO) {
    try {
      const problem = await this.prisma.problem.update({
        include: {
          testCases: true,
          constraint: true,
        },
        where: {
          problemId: id,
        },
        data: {
          title: updateProblemDTO.title,
          description: updateProblemDTO.description,
          hint: updateProblemDTO.hint,
          revaleCode: updateProblemDTO.revaleCode,
          isRegex: updateProblemDTO.isRegex,
          score: updateProblemDTO.score,
          testCases: {
            deleteMany: {},
            createMany: {
              data: updateProblemDTO.testcase,
            },
          },
          constraint: {
            deleteMany: {},
            createMany: {
              data: updateProblemDTO.constraint,
            },
          },
        },
      });
      return problem;
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteProblemById(id: string) {
    try {
      const problem = await this.prisma.problem.delete({
        where: {
          problemId: id,
        },
      });
      return problem;
    } catch (error) {
      throw new Error('Error Delete Problem');
    }
  }
}
