import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SubmissionDTO } from './dto/submission.dto';

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
          userId: username,
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
          userId: username,
          problemId: problemId,
        },
      });
      return count;
    } catch (error) {
      throw new Error('Error Fetch Submission count');
    }
  }

  async creteSubmissionByUsernameAndProblemId(
    submissionDTO: SubmissionDTO,
    no: number,
  ) {
    try {
      const submission = await this.prisma.submission.create({
        data: {
          problemId: submissionDTO.problemId,
          userId: submissionDTO.username,
          sourceCode: submissionDTO.sourceCode,
          result: submissionDTO.result,
          no: no,
          status: submissionDTO.status,
        },
      });
      return submission;
    } catch (error) {
      throw new Error('Error Create Submission');
    }
  }
}
