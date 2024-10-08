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
} from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IRequest } from 'src/auth/interface/request.interface';
import { Role } from '@prisma/client';
import { SubmissionDTO } from './dto/submission.dto';
import { FetchSubmissionDTO } from './dto/fetchSubmission.dto';
import { ProblemService } from 'src/problem/problem.service';
import { AssignmentService } from 'src/assignment/assignment.service';
import { CourseService } from 'src/course/course.service';
import { CourseStudentService } from 'src/course-student/course-student.service';
import { CourseTeacherService } from 'src/course-teacher/course-teacher.service';

@ApiBearerAuth()
@ApiTags('Submission')
@Controller('submission')
export class SubmissionController {
  constructor(
    private readonly submissionService: SubmissionService,
    private readonly problemService: ProblemService,
    private readonly assignmentService: AssignmentService,
    private readonly courseService: CourseService,
    private readonly courseStudentService: CourseStudentService,
    private readonly courseTeacherService: CourseTeacherService,
  ) {}

  @ApiOperation({ summary: 'Get All Submission (Admin)' })
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAllSubmission(@Request() req: IRequest) {
    if (req.user.role !== Role.ADMIN) {
      throw new HttpException(
        'Do Not Have Permission(Admin)',
        HttpStatus.FORBIDDEN,
      );
    }

    const submission = await this.submissionService.getAllSubmission();
    return {
      message: 'Successfully Get Submission',
      data: submission,
    };
  }

  @ApiOperation({
    summary:
      'Get Submission By Id With Username Your Self (Teacehr, Student, Admin)',
  })
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getSubmissionById(@Request() req: IRequest, @Param('id') id: string) {
    const invalidSubmission =
      await this.submissionService.getSubmissionById(id);
    if (!invalidSubmission) {
      throw new HttpException('Submission Not Found', HttpStatus.NOT_FOUND);
    }
    if (invalidSubmission.userId !== req.user.username) {
      throw new HttpException(
        'This Submission Not Your',
        HttpStatus.BAD_REQUEST,
      );
    }
    return {
      message: 'Successfully Get Submission',
      data: invalidSubmission,
    };
  }

  @ApiOperation({
    summary: 'Get All Submission By Username and ProblemId (Teacher)',
  })
  @UseGuards(AuthGuard('jwt'))
  @Post('getSubmission')
  async getAllSubmissionByUsernameAndProblemId(
    @Request() req: IRequest,
    @Body() fetchSubmissionDTO: FetchSubmissionDTO,
  ) {
    if (req.user.role !== Role.TEACHER) {
      throw new HttpException(
        'Do Not Have Permission(Teacher)',
        HttpStatus.FORBIDDEN,
      );
    }

    const problem = await this.problemService.getProblemById(
      fetchSubmissionDTO.problemId,
    );
    if (!problem) {
      throw new HttpException('Problem Not Found', HttpStatus.NOT_FOUND);
    }
    const assignment = await this.assignmentService.getAssigmentById(
      problem.assignmentId,
    );

    if (!assignment) {
      throw new HttpException('Assignment Not Found', HttpStatus.NOT_FOUND);
    }

    const course = await this.courseService.getCourseById(assignment.courseId);
    if (!assignment) {
      throw new HttpException('Course Not Found', HttpStatus.NOT_FOUND);
    }

    const courseTeacher =
      await this.courseTeacherService.getCourseTeacherByUsernameAndCourseId(
        req.user.username,
        course?.courseId as string,
      );
    const courseStudent =
      await this.courseStudentService.getCourseStudentByUsernameAndCourseId(
        fetchSubmissionDTO.username,
        course?.courseId as string,
      );
    if (!courseTeacher) {
      throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
    }

    if (!courseStudent) {
      throw new HttpException(
        'Student Not In This Course',
        HttpStatus.BAD_REQUEST,
      );
    }

    const submission =
      await this.submissionService.getSubmissionByUsernameAndProblemId(
        fetchSubmissionDTO.username,
        fetchSubmissionDTO.problemId,
      );
    if (submission.length === 0) {
      throw new HttpException('Submission Not Found', HttpStatus.NOT_FOUND);
    }
    return {
      message: 'Successfully Get Submission',
      data: submission,
    };
  }

  @ApiOperation({ summary: 'Create Submission (Admin)' })
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async getAllUser(
    @Request() req: IRequest,
    @Body() submissionDTO: SubmissionDTO,
  ) {
    if (req.user.role !== Role.ADMIN) {
      throw new HttpException(
        'Do Not Have Permission(Admin)',
        HttpStatus.FORBIDDEN,
      );
    }

    const noSubmission =
      (await this.submissionService.countSubmissionByUsernameAndProblemId(
        submissionDTO.username,
        submissionDTO.problemId,
      )) || 0;

    const submission =
      await this.submissionService.creteSubmissionByUsernameAndProblemId(
        submissionDTO,
        noSubmission,
      );
    return {
      message: 'Successfully Create Submission',
      data: submission,
    };
  }
}
