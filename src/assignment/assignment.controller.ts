import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Post,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IRequest } from 'src/auth/interface/request.interface';
import { CourseService } from 'src/course/course.service';
import { CreateAssigmentDTO } from './dto/createAssignment.dto';
import { Problem, Role } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { UpdateAssignmentDTO } from './dto/updateAssignment.dto';
import { AddDateAssignmentDTO } from './dto/addDateAssignment.dto';
import { UpdateLockAssignmentDTO } from './dto/updateLOckAssignment.dto';

@ApiBearerAuth()
@ApiTags('Assignment')
@Controller('assignment')
export class AssignmentController {
  constructor(
    private readonly assignmentService: AssignmentService,
    private readonly courseService: CourseService,
    private readonly configService: ConfigService,
  ) {}

  //@ApiOperation({
  //  summary: 'Get All Assignment By Course Id (Teacher, Student)',
  //})
  //@UseGuards(AuthGuard('jwt'))
  //@Get(':courseId')
  //async getAssignmentByCourseId(
  //  @Request() req: IRequest,
  //  @Param('courseId') courseId: string,
  //) {
  //  if (req.user.role !== Role.TEACHER && req.user.role !== Role.STUDENT) {
  //    throw new HttpException(
  //      'Do Not Have Permission(Teacher)',
  //      HttpStatus.FORBIDDEN,
  //    );
  //  }
  //  const course = await this.courseService.getCourseById(courseId);
  //  if (!course) {
  //    throw new HttpException('Course Not Found', HttpStatus.NOT_FOUND);
  //  }
  //  const courseStudent =
  //    await this.courseStudentService.getCourseStudentByUsernameAndCourseId(
  //      req.user.username,
  //      courseId,
  //    );
  //  const courseTeacher =
  //    await this.courseTeacherService.getCourseTeacherByUsernameAndCourseId(
  //      req.user.username,
  //      courseId,
  //    );
  //
  //  if (!courseStudent && !courseTeacher) {
  //    throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
  //  }
  //  const assignments =
  //    await this.assignmentService.getAssigmentByCourseId(courseId);
  //
  //  const problemIds = assignments.flatMap((assignment) =>
  //    assignment.problem.map((problem) => problem.problemId),
  //  );
  //  const submissions =
  //    await this.assignmentService.getManySubmissonByUsernameAndProblemId(
  //      req.user.username,
  //      problemIds,
  //    );
  //
  //  const submissionMap = submissions.reduce(
  //    (acc, submission) => {
  //      //acc[submission.problemId] = submission.stateSubmission;
  //      return acc;
  //    },
  //    {} as Record<string, boolean | null>,
  //  );
  //
  //  const updatedAssignments = assignments.map((assignment) => {
  //    const updatedProblems = assignment.problem.map((problem) => {
  //      return {
  //        problemId: problem.problemId,
  //        score: problem.score,
  //        status: submissionMap[problem.problemId] || false,
  //      };
  //    });
  //    delete (assignment as { problem?: Problem[] }).problem;
  //    return {
  //      ...assignment,
  //      problem: updatedProblems,
  //    };
  //  });
  //  return {
  //    message: 'Successfully Get Assignment',
  //    data: updatedAssignments,
  //  };
  //}
  //
  //@ApiOperation({
  //  summary: 'Create Assignment By Course Id (Teacher)',
  //})
  //@UseGuards(AuthGuard('jwt'))
  //@Post()
  //async createAssignmentByCourseId(
  //  @Request() req: IRequest,
  //  @Body() createAssignmentDTO: CreateAssigmentDTO,
  //) {
  //  if (req.user.role !== Role.TEACHER) {
  //    throw new HttpException(
  //      'Do Not Have Permission(Teacher)',
  //      HttpStatus.FORBIDDEN,
  //    );
  //  }
  //
  //  const course = await this.courseService.getCourseById(
  //    createAssignmentDTO.courseId,
  //  );
  //  if (!course) {
  //    throw new HttpException('Course Not Found', HttpStatus.NOT_FOUND);
  //  }
  //
  //  const courseTeacher =
  //    await this.courseTeacherService.getCourseTeacherByUsernameAndCourseId(
  //      req.user.username,
  //      createAssignmentDTO.courseId,
  //    );
  //
  //  if (!courseTeacher) {
  //    throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
  //  }
  //  const countAssignment = await this.assignmentService.countAssignment(
  //    createAssignmentDTO.courseId,
  //  );
  //
  //  if (countAssignment >= this.configService.get('ASSIGNMENT_LIMIT')) {
  //    throw new HttpException(
  //      `Over the limit Create Assignment ${this.configService.get('ASSIGNMENT_LIMIT')}`,
  //      HttpStatus.NOT_ACCEPTABLE,
  //    );
  //  }
  //  const assignment =
  //    await this.assignmentService.createAssignmentByCourseId(
  //      createAssignmentDTO,
  //    );
  //  return {
  //    message: 'Create Assignment Successfully',
  //    data: assignment,
  //  };
  //}
  //
  //@ApiOperation({
  //  summary: 'Add Date Assignment By Id (Teacher)',
  //})
  //@UseGuards(AuthGuard('jwt'))
  //@Patch('date/:id')
  //async addDateAssignmentById(
  //  @Request() req: IRequest,
  //  @Body() addDateAssignmentDTO: AddDateAssignmentDTO,
  //  @Param('id') id: string,
  //) {
  //  if (req.user.role !== Role.TEACHER) {
  //    throw new HttpException(
  //      'Do Not Have Permission(Teacher)',
  //      HttpStatus.FORBIDDEN,
  //    );
  //  }
  //
  //  const invalidAssignment = await this.assignmentService.getAssigmentById(id);
  //  if (!invalidAssignment) {
  //    throw new HttpException('Assignment Not Found', HttpStatus.NOT_FOUND);
  //  }
  //
  //  const courseTeacher =
  //    await this.courseTeacherService.getCourseTeacherByUsernameAndCourseId(
  //      req.user.username,
  //      invalidAssignment.courseId,
  //    );
  //
  //  if (!courseTeacher) {
  //    throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
  //  }
  //  const assignment = await this.assignmentService.addDateAssignmentById(
  //    addDateAssignmentDTO,
  //    id,
  //  );
  //
  //  return {
  //    message: 'Successfully Add Date Assignment',
  //    data: assignment,
  //  };
  //}
  //
  //@ApiOperation({
  //  summary: 'Update Lock Assignment By Id (Teacher)',
  //})
  //@UseGuards(AuthGuard('jwt'))
  //@Patch('lock/:id')
  //async updatStatusAssignmentById(
  //  @Request() req: IRequest,
  //  @Body() updateLockAssignmentDTO: UpdateLockAssignmentDTO,
  //  @Param('id') id: string,
  //) {
  //  if (req.user.role !== Role.TEACHER) {
  //    throw new HttpException(
  //      'Do Not Have Permission(Teacher)',
  //      HttpStatus.FORBIDDEN,
  //    );
  //  }
  //
  //  const invalidAssignment = await this.assignmentService.getAssigmentById(id);
  //  if (!invalidAssignment) {
  //    throw new HttpException('Assignment Not Found', HttpStatus.NOT_FOUND);
  //  }
  //
  //  const courseTeacher =
  //    await this.courseTeacherService.getCourseTeacherByUsernameAndCourseId(
  //      req.user.username,
  //      invalidAssignment.courseId,
  //    );
  //
  //  if (!courseTeacher) {
  //    throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
  //  }
  //  const assignment = await this.assignmentService.updateLockAssignmentById(
  //    updateLockAssignmentDTO,
  //    id,
  //  );
  //
  //  return {
  //    message: 'Successfully Update Lock Assignment',
  //    data: assignment,
  //  };
  //}
  //
  //@ApiOperation({
  //  summary: 'Update Assignment By Id (Teacher)',
  //})
  //@UseGuards(AuthGuard('jwt'))
  //@Patch(':id')
  //async updateAssignmentById(
  //  @Request() req: IRequest,
  //  @Param('id') id: string,
  //  @Body() updateAssignmentDTO: UpdateAssignmentDTO,
  //) {
  //  if (req.user.role !== Role.TEACHER) {
  //    throw new HttpException(
  //      'Do Not Have Permission(Teacher)',
  //      HttpStatus.FORBIDDEN,
  //    );
  //  }
  //
  //  const invalidAssignment = await this.assignmentService.getAssigmentById(id);
  //  if (!invalidAssignment) {
  //    throw new HttpException('Assignment Not Found', HttpStatus.NOT_FOUND);
  //  }
  //
  //  const courseTeacher =
  //    await this.courseTeacherService.getCourseTeacherByUsernameAndCourseId(
  //      req.user.username,
  //      invalidAssignment.courseId,
  //    );
  //
  //  if (!courseTeacher) {
  //    throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
  //  }
  //
  //  const assignment = await this.assignmentService.updateAssingmentById(
  //    updateAssignmentDTO,
  //    id,
  //  );
  //  return {
  //    message: 'Update Assignment Successfully',
  //    data: assignment,
  //  };
  //}
  //
  //@ApiOperation({
  //  summary: 'Delete Assignment By Id (Teacher)',
  //})
  //@UseGuards(AuthGuard('jwt'))
  //@Delete(':id')
  //async deleteAssignmentById(
  //  @Request() req: IRequest,
  //  @Param('id') id: string,
  //) {
  //  if (req.user.role !== Role.TEACHER) {
  //    throw new HttpException(
  //      'Do Not Have Permission(Teacher)',
  //      HttpStatus.FORBIDDEN,
  //    );
  //  }
  //
  //  const invalidAssignment = await this.assignmentService.getAssigmentById(id);
  //  if (!invalidAssignment) {
  //    throw new HttpException('Assignment Not Found', HttpStatus.NOT_FOUND);
  //  }
  //
  //  const courseTeacher =
  //    await this.courseTeacherService.getCourseTeacherByUsernameAndCourseId(
  //      req.user.username,
  //      invalidAssignment.courseId,
  //    );
  //
  //  if (!courseTeacher) {
  //    throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
  //  }
  //
  //  const assignment = await this.assignmentService.deleteAssignmentById(id);
  //  return {
  //    message: 'Delete Assignment Successfully',
  //    data: assignment,
  //  };
  //}
}
