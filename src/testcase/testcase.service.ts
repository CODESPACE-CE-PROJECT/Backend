import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTestCaseDTO } from './dto/createTestCaseDTO.dto';
import { UpdateTestCaseDTO } from './dto/updateTestCaseDTO.dto';

@Injectable()
export class TestcaseService {
  constructor(private readonly prisma: PrismaService) {}

  async getTestCaseById(id: string) {
    try {
      const testcase = await this.prisma.testCase.findMany({
        where: {
          testCaseId: id,
        },
      });
      return testcase;
    } catch (error) {
      throw new Error('Error Fetch Test Case');
    }
  }

  async getTestCaseByProblemId(problemId: string) {
    try {
      const testcase = await this.prisma.testCase.findMany({
        where: {
          problemId: problemId,
        },
      });
      return testcase;
    } catch (error) {
      throw new Error('Error Fetch Test Case');
    }
  }

  async createTestCaseByProblemId(createTestCaseDTO: CreateTestCaseDTO) {
    try {
      const testCaseFormat = createTestCaseDTO.testCases.map((item) => ({
        problemId: createTestCaseDTO.problemId,
        input: item.input,
        output: item.output,
        isHidden: item.isHidden,
      }));

      const testcase = await this.prisma.testCase.createMany({
        data: testCaseFormat,
      });
      return testcase;
    } catch (error) {
      throw new Error('Error Create Test Case');
    }
  }

  async updateTestCaseByProblemId(
    problemId: string,
    updateTestCaseDTO: UpdateTestCaseDTO,
  ) {
    try {
      await this.prisma.testCase.deleteMany({
        where: {
          problemId: problemId,
        },
      });
      const testCaseFormat = updateTestCaseDTO.testCases.map((item) => ({
        problemId: problemId,
        input: item.input,
        output: item.output,
        isHidden: item.isHidden,
      }));

      const testcase = await this.prisma.testCase.createMany({
        data: testCaseFormat,
      });
      return testcase;
    } catch (error) {
      throw new Error(error);
    }
  }
}
