import {
  Controller,
  Get,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IRequest } from 'src/auth/interface/request.interface';
import { Role } from '@prisma/client';
import { SubmissionDTO } from './dto/submission.dto';
import { ProblemService } from 'src/problem/problem.service';
import { UtilsService } from 'src/utils/utils.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiBearerAuth()
@ApiTags('Submission')
@Controller('submission')
export class SubmissionController {
  constructor(
    private readonly submissionService: SubmissionService,
    private readonly problemService: ProblemService,
    private readonly utilsService: UtilsService,
  ) {}

  @ApiOperation({ summary: 'Get All Submission (Admin)' })
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllSubmission(@Request() req: IRequest) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.ADMIN,
    ]);
    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }
    const submission = await this.submissionService.getAllSubmission();
    return {
      message: 'Successfully Get Submission',
      data: submission,
    };
  }

  @ApiOperation({
    summary: 'Get Submission By Id With Username Your Self (Teacher, Student)',
  })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getSubmissionById(
    @Request() req: IRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const validSubmission = await this.submissionService.getSubmissionById(id);

    if (!validSubmission) {
      throw new HttpException('Submission Not Found', HttpStatus.NOT_FOUND);
    }

    if (validSubmission.username !== req.user.username) {
      throw new HttpException(
        'This Submission Not Your',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      message: 'Successfully Get Submission',
      data: validSubmission,
    };
  }

  @ApiOperation({
    summary: 'Get All Submission By Username and ProblemId (Teacher)',
  })
  @UseGuards(JwtAuthGuard)
  @Post(':problemId/:username')
  async getAllSubmissionByUsernameAndProblemId(
    @Request() req: IRequest,
    @Param('problemId', ParseUUIDPipe) problemId: string,
    @Param('username') username: string,
  ) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.TEACHER,
    ]);
    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }

    const problem = await this.problemService.getProblemById(problemId);
    if (!problem) {
      throw new HttpException('Problem Not Found', HttpStatus.NOT_FOUND);
    }

    const teacher = problem.assignment?.course.courseTeacher.find(
      (teacher) => teacher.username === req.user.username,
    );
    const student = problem.assignment?.course.courseStudent.find(
      (student) => student.username === req.user.username,
    );

    if (!teacher && !student) {
      throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
    }
    const submission =
      await this.submissionService.getSubmissionByUsernameAndProblemId(
        username,
        problemId,
      );

    return {
      message: 'Successfully Get Submission',
      data: submission,
    };
  }

  @ApiOperation({ summary: 'Create Submission (Student, Teacher)' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async createSubmission(
    @Request() req: IRequest,
    @Body() submissionDTO: SubmissionDTO,
  ) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.TEACHER,
      Role.STUDENT,
    ]);
    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }

    const problem = await this.problemService.getProblemById(
      submissionDTO.problemId,
    );
    if (!problem) {
      throw new HttpException('Problem Not Found', HttpStatus.NOT_FOUND);
    }
    const teacher = problem.assignment?.course.courseTeacher.find(
      (teacher) => teacher.username === req.user.username,
    );
    const student = problem.assignment?.course.courseStudent.find(
      (student) => student.username === req.user.username,
    );

    if (!teacher && !student) {
      throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
    }

    const noSubmission =
      (await this.submissionService.countSubmissionByUsernameAndProblemId(
        req.user.username,
        submissionDTO.problemId,
      )) + 1;

    const submission =
      await this.submissionService.createSubmissionByUsernameAndProblemId(
        submissionDTO,
        noSubmission,
        req.user.username,
      );
    return {
      message: 'Successfully Create Submission',
      data: submission,
    };
  }
}
