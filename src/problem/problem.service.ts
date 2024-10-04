import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProblemDTO } from './dto/createProblemDTO.dto';
import { UpdateProblemDTO } from './dto/updateProblemDTO.dto';

@Injectable()
export class ProblemService {
  constructor(private readonly prisma: PrismaService) {}

  async getProblemByAssignmentId(assignmentId: string) {
    try {
      const problem = await this.prisma.problem.findMany({
        where: {
          assignmentId: assignmentId,
        },
        include: {
          testCases: true,
          constraint: true,
        },
      });
      return problem;
    } catch (error) {
      throw new Error('Error Fetch Problem');
    }
  }

  async getProblemById(id: string) {
    try {
      const problem = await this.prisma.problem.findUnique({
        where: {
          problemId: id,
        },
        include: {
          testCases: true,
          constraint: true,
        },
      });
      return problem;
    } catch (error) {
      throw new Error('Error Fetch Problem');
    }
  }

  async createProblemByAssignmentId(createProblemDTO: CreateProblemDTO) {
    try {
      const problem = await this.prisma.problem.create({
        data: {
          title: createProblemDTO.title,
          description: createProblemDTO.description,
          hint: createProblemDTO.hint,
          revaleCode: createProblemDTO.revaleCode,
          isRegex:
            createProblemDTO.isRegex.toString() === 'true' ||
            createProblemDTO.isRegex === true,
          assignmentId: createProblemDTO.assignmentId,
          score: parseInt(createProblemDTO.score.toString(), 10),
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
        where: {
          problemId: id,
        },
        data: {
          title: updateProblemDTO.title,
          description: updateProblemDTO.description,
          hint: updateProblemDTO.hint,
          revaleCode: updateProblemDTO.revaleCode,
          isRegex:
            updateProblemDTO.isRegex.toString() === 'true' ||
            updateProblemDTO.isRegex === true,
          score: parseInt(updateProblemDTO.score.toString(), 10),
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
