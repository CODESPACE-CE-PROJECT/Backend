import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProblemDTO } from './dto/createProblemDTO.dto';

@Injectable()
export class ProblemService {
  constructor(private readonly prisma: PrismaService) {}

  async getProblemByAssignmentId(assignmentId: string) {
    try {
      const problem = await this.prisma.problem.findMany({
        where: {
          assignmentId: assignmentId,
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
      throw new Error(error);
    }
  }
}
