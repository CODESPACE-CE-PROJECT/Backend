import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProblemDTO } from './dto/createProblemDTO.dto';
import { UpdateProblemDTO } from './dto/updateProblemDTO.dto';

@Injectable()
export class ProblemService {
  constructor(private readonly prisma: PrismaService) {}

  async getProblemById(id: string, username?: string) {
    try {
      const problem = await this.prisma.problem.findUnique({
        where: {
          problemId: id,
        },
        include: {
          assignment: {
            select: {
              title: true,
              expireAt: true,
              problem: {
                select: {
                  problemId: true,
                  title: true,
                  submission: {
                    where: {
                      username: username,
                    },
                    orderBy: {
                      createdAt: 'desc',
                    },
                  },
                },
                orderBy: {
                  title: 'asc',
                },
              },
              course: {
                select: {
                  title: true,
                  courseTeacher: true,
                  courseStudent: true,
                },
              },
            },
          },
          testCases: true,
          constraint: true,
          submission: {
            where: {
              username: username,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });
      return problem;
    } catch (error) {
      throw new Error('Error Fetch Problem');
    }
  }

  async countProblemByAssignmentId(assignmentId: string) {
    try {
      const count = await this.prisma.problem.count({
        where: {
          assignmentId: assignmentId,
        },
      });
      return count;
    } catch (error) {
      throw new Error('Error Fetch Count Problem');
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
      const problems = await Promise.all(
        createProblemDTO.problem.map(async (problem) => {
          const resultProblem = await this.prisma.problem.create({
            include: {
              testCases: true,
              constraint: true,
            },
            data: {
              title: problem.title,
              description: problem.description,
              hint: problem.hint,
              revaleCode: problem.revaleCode,
              isRegex: problem.isRegex,
              assignmentId: createProblemDTO.assignmentId,
              language: problem.language,
              score: problem.score,
              testCases: {
                createMany: {
                  data: problem.testcase,
                },
              },
              constraint: {
                createMany: {
                  data: problem.constraint,
                },
              },
            },
          });
          return resultProblem;
        }),
      );

      return problems;
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
