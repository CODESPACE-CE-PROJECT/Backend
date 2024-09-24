import {
  Controller,
  Get,
  UseGuards,
  Request,
  Param,
  HttpException,
  HttpStatus,
  Body,
  Post,
} from '@nestjs/common';
import { ProblemService } from './problem.service';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IRequest } from 'src/auth/interface/request.interface';
import { AssignmentService } from 'src/assignment/assignment.service';
import { CourseStudentService } from 'src/course-student/course-student.service';
import { CourseTeacherService } from 'src/course-teacher/course-teacher.service';
import { CourseService } from 'src/course/course.service';
import { CreateProblemDTO } from './dto/createProblemDTO.dto';
import { Role } from '@prisma/client';

@ApiTags('Problem')
@Controller('problem')
export class ProblemController {
  constructor(
    private readonly problemService: ProblemService,
    private readonly courseService: CourseService,
    private readonly assignmentService: AssignmentService,
    private readonly courseStudentService: CourseStudentService,
    private readonly courseTeacherService: CourseTeacherService,
  ) {}

  @ApiOperation({
    summary: 'Get All Problem By Assignment Id (Teacher, Student)',
  })
  @UseGuards(AuthGuard('jwt'))
  @Get(':assignmentId')
  async getProblemByAssignmentId(
    @Request() req: IRequest,
    @Param('assignmentId') assignmentId: string,
  ) {
    const invalidAssignment =
      await this.assignmentService.getAssigmentById(assignmentId);
    if (!invalidAssignment) {
      throw new HttpException('Assignemnt Not Found', HttpStatus.NOT_FOUND);
    }
    const course = await this.courseService.getCourseById(
      invalidAssignment.courseId,
    );
    if (!course) {
      throw new HttpException('Course Not Found', HttpStatus.NOT_FOUND);
    }
    const courseStudent =
      await this.courseStudentService.getCourseStudentByUsernameAndCourseId(
        req.user.username,
        course.courseId,
      );
    const courseTeacher =
      await this.courseTeacherService.getCourseTeacherByUsernameAndCourseId(
        req.user.username,
        course.courseId,
      );

    if (!courseStudent && !courseTeacher) {
      throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
    }

    const problem =
      await this.problemService.getProblemByAssignmentId(assignmentId);
    return {
      message: 'Successfully Get Problem',
      data: problem,
    };
  }

  @ApiOperation({
    summary: 'Create Problem By Assignment Id (Teacher)',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiConsumes('application/json')
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createProblemByAssignmentId(
    @Request() req: IRequest,
    @Body() createProblemDTO: CreateProblemDTO,
  ) {
    if (req.user.role !== Role.TEACHER) {
      throw new HttpException(
        'Do Not Have Permission(Teacher)',
        HttpStatus.FORBIDDEN,
      );
    }

    const invalidAssignment = await this.assignmentService.getAssigmentById(
      createProblemDTO.assignmentId,
    );
    if (!invalidAssignment) {
      throw new HttpException('Assignemnt Not Found', HttpStatus.NOT_FOUND);
    }
    const course = await this.courseService.getCourseById(
      invalidAssignment.courseId,
    );
    if (!course) {
      throw new HttpException('Course Not Found', HttpStatus.NOT_FOUND);
    }
    const courseTeacher =
      await this.courseTeacherService.getCourseTeacherByUsernameAndCourseId(
        req.user.username,
        course.courseId,
      );

    if (!courseTeacher) {
      throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
    }

    const problem =
      await this.problemService.createProblemByAssignmentId(createProblemDTO);
    return {
      message: 'Create Problem Successfully',
      data: problem,
    };
  }
}
