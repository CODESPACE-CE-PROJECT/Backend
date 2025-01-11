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
  ParseUUIDPipe,
  ParseBoolPipe,
  HttpCode,
} from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IRequest } from 'src/auth/interface/request.interface';
import { CourseService } from 'src/course/course.service';
import { CreateAssigmentDTO } from './dto/createAssignment.dto';
import { Problem, Role, StateSubmission } from '@prisma/client';
import { UpdateAssignmentDTO } from './dto/updateAssignment.dto';
import { UtilsService } from 'src/utils/utils.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiBearerAuth()
@ApiTags('Assignment')
@Controller('assignment')
export class AssignmentController {
  constructor(
    private readonly assignmentService: AssignmentService,
    private readonly courseService: CourseService,
    private readonly utilsService: UtilsService,
  ) {}

  @ApiOperation({
    summary: 'Get All Assignment By Course Id (Teacher, Student)',
  })
  @UseGuards(JwtAuthGuard)
  @Get(':courseId')
  async getAssignmentByCourseId(
    @Request() req: IRequest,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.TEACHER,
      Role.STUDENT,
    ]);

    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }
    const course = await this.courseService.getCourseById(courseId);

    if (!course) {
      throw new HttpException('Course Not Found', HttpStatus.NOT_FOUND);
    }

    const teacher = course.courseTeacher.find(
      (teacher) => teacher.username == req.user.username,
    );
    const student = course.courseStudent.find(
      (student) => student.username == req.user.username,
    );

    if (!teacher && !student) {
      throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
    }

    const assignments =
      await this.assignmentService.getAssigmentByCourseId(courseId);

    if (req.user.role === Role.TEACHER) {
      const updateAssignment = assignments.map((assignment) => {
        const updateProblems = assignment.problem.map((problem) => {
          return {
            problemId: problem.problemId,
            score: problem.score,
          };
        });
        const totalScore = updateProblems.reduce(
          (total, curr) => total + curr.score,
          0,
        );

        delete (assignment as { problem?: Problem[] }).problem;
        return {
          ...assignment,
          problem: updateProblems,
          totalScore: totalScore,
        };
      });

      return {
        message: 'Successfully Get Assignment',
        data: updateAssignment,
      };
    }

    const problemIds = assignments.flatMap((assignment) =>
      assignment.problem.map((problem) => problem.problemId),
    );

    const submissions =
      await this.assignmentService.getManySubmissonByUsernameAndProblemId(
        req.user.username,
        problemIds,
      );

    const submissionMap = submissions.reduce(
      (acc, submission) => {
        acc[submission.problemId] =
          acc[submission.problemId] === StateSubmission.PASS
            ? StateSubmission.PASS
            : submission.stateSubmission;
        return acc;
      },
      {} as Record<string, StateSubmission | null>,
    );

    const updatedAssignments = assignments.map((assignment) => {
      const updatedProblems = assignment.problem.map((problem) => {
        return {
          problemId: problem.problemId,
          score: problem.score,
          stateSubmission:
            submissionMap[problem.problemId] || StateSubmission.NOTSEND,
        };
      });

      const totalScore = updatedProblems
        .filter((problem) => problem.stateSubmission === StateSubmission.PASS)
        .reduce((total, curr) => total + curr.score, 0);

      delete (assignment as { problem?: Problem[] }).problem;

      return {
        ...assignment,
        problem: updatedProblems,
        totalScore: totalScore,
      };
    });

    return {
      message: 'Successfully Get Assignment',
      data: updatedAssignments,
    };
  }

  @ApiOperation({
    summary:
      'Get All Assignment For Calendar By Username Yourself (Teacher, Student)',
  })
  @UseGuards(JwtAuthGuard)
  @Get('calendar/info')
  async getAllAssignmentForCalendar(@Request() req: IRequest) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.TEACHER,
      Role.STUDENT,
    ]);

    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }
    const assignment = await this.assignmentService.getAllAssignmentForCalendar(
      req.user.username,
    );
    return {
      message: 'Successfully Get Assignment',
      data: assignment,
    };
  }

  @ApiOperation({
    summary: 'Get All People Score Assignment By Course Id (Teacher)',
  })
  @UseGuards(JwtAuthGuard)
  @Get(':courseId/score')
  async getPeopleScoreByAssignemtId(
    @Request() req: IRequest,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.TEACHER,
    ]);

    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }
    const course = await this.courseService.getCourseById(courseId);

    if (!course) {
      throw new HttpException('Course Not Found', HttpStatus.NOT_FOUND);
    }

    const teacher = course.courseTeacher.find(
      (teacher) => teacher.username == req.user.username,
    );

    if (!teacher) {
      throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
    }

    const assignments =
      await this.assignmentService.getAssigmentByCourseId(courseId);

    const score = await Promise.all(
      assignments.map(async (assignment) => {
        const scoresPerStudent = await Promise.all(
          course.courseStudent.map(async (student) => {
            const submissions =
              await this.assignmentService.getManySubmissonByUsernameAndProblemId(
                student.username,
                assignment.problem.map((problem) => problem.problemId),
              );

            const problemScores = assignment.problem.map((problem) => {
              const submission = submissions.find(
                (sub) => sub.problemId === problem.problemId,
              );

              const isPass =
                submission?.stateSubmission === StateSubmission.PASS;
              return {
                problemId: problem.problemId,
                score: isPass ? problem.score : 0,
                status: submission?.stateSubmission || StateSubmission.NOTSEND,
              };
            });

            const totalScore = problemScores.reduce(
              (total, p) => total + p.score,
              0,
            );

            return {
              username: student.username,
              firstName: student.user.firstName,
              lastName: student.user.lastName,
              problems: problemScores,
              totalScore,
            };
          }),
        );

        return {
          assignmentId: assignment.assignmentId,
          title: assignment.title,
          scores: scoresPerStudent,
        };
      }),
    );

    return {
      message: 'Successfully Get People Score',
      data: score,
    };
  }

  @ApiOperation({
    summary: 'Create Assignment By Course Id (Teacher)',
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  async createAssignmentByCourseId(
    @Request() req: IRequest,
    @Body() createAssignmentDTO: CreateAssigmentDTO,
  ) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.TEACHER,
    ]);

    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }

    if (
      new Date(createAssignmentDTO.expireAt) <=
      new Date(createAssignmentDTO.startAt)
    ) {
      throw new HttpException(
        'ExpireAt Date Must Have To Grater Than StartAt',
        HttpStatus.BAD_REQUEST,
      );
    }

    const course = await this.courseService.getCourseById(
      createAssignmentDTO.courseId,
    );
    if (!course) {
      throw new HttpException('Course Not Found', HttpStatus.NOT_FOUND);
    }

    const teacher = course.courseTeacher.find(
      (teacher) => teacher.username == req.user.username,
    );

    if (!teacher) {
      throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
    }

    const isTitleExitst =
      await this.assignmentService.checkTitleExistByCourseId(
        createAssignmentDTO.courseId,
        createAssignmentDTO.title,
      );

    if (isTitleExitst) {
      throw new HttpException(
        'Title Already in This Course',
        HttpStatus.BAD_REQUEST,
      );
    }

    const assignment = await this.assignmentService.createAssignmentByCourseId(
      createAssignmentDTO,
      req.user.username,
    );

    return {
      message: 'Create Assignment Successfully',
      data: assignment,
    };
  }

  @ApiOperation({
    summary: 'Update Lock Assignment By Id (Teacher)',
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id/:lock')
  async updatStatusAssignmentById(
    @Request() req: IRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('lock', ParseBoolPipe) lock: boolean,
  ) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.TEACHER,
    ]);

    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }

    const validAssignment = await this.assignmentService.getAssignmentById(id);

    if (!validAssignment) {
      throw new HttpException('Assignment Not Found', HttpStatus.NOT_FOUND);
    }

    const teacher = validAssignment.course.courseTeacher.find(
      (teacher) => teacher.username == req.user.username,
    );

    if (!teacher) {
      throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
    }
    const assignment = await this.assignmentService.updateLockAssignmentById(
      lock,
      id,
    );

    return {
      message: 'Successfully Update Lock Assignment',
      data: assignment,
    };
  }

  @ApiOperation({
    summary: 'Update Assignment By Id (Teacher)',
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateAssignmentById(
    @Request() req: IRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAssignmentDTO: UpdateAssignmentDTO,
  ) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.TEACHER,
    ]);

    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }

    const validAssignment = await this.assignmentService.getAssignmentById(id);

    if (!validAssignment) {
      throw new HttpException('Assignment Not Found', HttpStatus.NOT_FOUND);
    }

    const teacher = validAssignment.course.courseTeacher.find(
      (teacher) => teacher.username == req.user.username,
    );

    if (!teacher) {
      throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
    }

    const assignment = await this.assignmentService.updateAssingmentById(
      updateAssignmentDTO,
      id,
      validAssignment.title,
      req.user.username,
    );
    return {
      message: 'Update Assignment Successfully',
      data: assignment,
    };
  }

  @ApiOperation({
    summary: 'Delete Assignment By Id (Teacher)',
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteAssignmentById(
    @Request() req: IRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.TEACHER,
    ]);

    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }

    const invalidAssignment =
      await this.assignmentService.getAssignmentById(id);

    if (!invalidAssignment) {
      throw new HttpException('Assignment Not Found', HttpStatus.NOT_FOUND);
    }

    const teacher = invalidAssignment.course.courseTeacher.find(
      (teacher) => teacher.username == req.user.username,
    );

    if (!teacher) {
      throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
    }

    const assignment = await this.assignmentService.deleteAssignmentById(
      id,
      req.user.username,
    );
    return {
      message: 'Delete Assignment Successfully',
      data: assignment,
    };
  }
}
