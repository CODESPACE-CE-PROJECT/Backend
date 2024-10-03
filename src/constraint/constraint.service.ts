import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateConstraintDTO } from './dto/createConstraint.dto';
import { UpdateConstraintDTO } from './dto/updateConstraint.dto';

@Injectable()
export class ConstraintService {
  constructor(private readonly prisma: PrismaService) {}

  async getConstraintById(id: string) {
    try {
      const constraint = await this.prisma.constraint.findUnique({
        where: {
          constraintId: id,
        },
      });
      return constraint;
    } catch (error) {
      throw new Error('Error Fetch Constraint');
    }
  }

  async getConstraintByProblemId(problemId: string) {
    try {
      const constraint = await this.prisma.constraint.findMany({
        where: {
          problemId: problemId,
        },
      });
      return constraint;
    } catch (error) {
      throw new Error('Error Fetch Constraint');
    }
  }

  async createConstraintByProblemId(createConstraintDTO: CreateConstraintDTO) {
    try {
      const constraintFormat = createConstraintDTO.constraints.map((item) => ({
        problemId: createConstraintDTO.problemId,
        type: item.type,
        keyword: item.keyword,
        quantities: item.qunatities,
      }));
      const constraint = await this.prisma.constraint.createMany({
        data: constraintFormat,
      });
      return constraint;
    } catch (error) {
      throw new Error('Error Create Constraint');
    }
  }

  async updateConstraintByProblemId(
    problemId: string,
    updateConstraintDTO: UpdateConstraintDTO,
  ) {
    try {
      await this.prisma.constraint.deleteMany({
        where: {
          problemId: problemId,
        },
      });
      const constraintFormat = updateConstraintDTO.constraints.map((item) => ({
        problemId: problemId,
        type: item.type,
        keyword: item.keyword,
        quantities: item.qunatities,
      }));
      const constraint = await this.prisma.constraint.createMany({
        data: constraintFormat,
      });
      return constraint;
    } catch (error) {
      throw new Error('Error Create Constraint');
    }
  }
}
