import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SubmissionDTO } from './dto/submission.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SubmissionService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllSubmission() {
    try {
      const submission = await this.prisma.submission.findMany();
      return submission;
    } catch (error) {
      throw new Error('Error Fetch Submission');
    }
  }

  async getSubmissionById(id: string) {
    try {
      const submission = await this.prisma.submission.findUnique({
        where: {
          submissionId: id,
        },
      });
      return submission;
    } catch (error) {
      throw new Error('Error Fetch Submission');
    }
  }

  async getSubmissionByUsernameAndProblemId(
    username: string,
    problemId: string,
  ) {
    try {
      const submission = await this.prisma.submission.findMany({
        where: {
          username: username,
          problemId: problemId,
        },
      });
      return submission;
    } catch (error) {
      throw new Error('Error Fetch Submission');
    }
  }

  async countSubmissionByUsernameAndProblemId(
    username: string,
    problemId: string,
  ) {
    try {
      const count = await this.prisma.submission.count({
        where: {
          username: username,
          problemId: problemId,
        },
      });
      return count;
    } catch (error) {
      throw new Error('Error Fetch Submission count');
    }
  }

  async createSubmissionByUsernameAndProblemId(
    submissionDTO: SubmissionDTO,
    no: number,
    username: string,
  ) {
    try {
      const submission = await this.prisma.submission.create({
        data: {
          problemId: submissionDTO.problemId,
          username: username,
          sourceCode: submissionDTO.sourceCode,
          result: submissionDTO.results as Prisma.JsonArray,
          no: no,
          stateSubmission: 'PASS',
        },
      });
      return submission;
    } catch (error) {
      throw new Error('Error Create Submission');
    }
  }
}
