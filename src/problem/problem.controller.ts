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
  Patch,
  Delete,
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
import { UpdateProblemDTO } from './dto/updateProblemDTO.dto';
import { CreateTestCaseDTO } from 'src/testcase/dto/createTestCaseDTO.dto';
import { TestcaseService } from 'src/testcase/testcase.service';
import { UpdateTestCaseDTO } from 'src/testcase/dto/updateTestCaseDTO.dto';
import { ConstraintService } from 'src/constraint/constraint.service';
import { CreateConstraintDTO } from 'src/constraint/dto/createConstraint.dto';
import { UpdateConstraintDTO } from 'src/constraint/dto/updateConstraint.dto';

@ApiTags('Problem')
@Controller('problem')
export class ProblemController {
  constructor(
    private readonly problemService: ProblemService,
    private readonly courseService: CourseService,
    private readonly assignmentService: AssignmentService,
    private readonly courseStudentService: CourseStudentService,
    private readonly courseTeacherService: CourseTeacherService,
    private readonly testcaseService: TestcaseService,
    private readonly constraintService: ConstraintService,
  ) {}

  @ApiOperation({
    summary: 'Get Problem By Id (Teacher, Student)',
  })
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getProblemById(@Request() req: IRequest, @Param('id') id: string) {
    const problem = await this.problemService.getProblemById(id);
    if (!problem) {
      throw new HttpException('Problem Not Found', HttpStatus.NOT_FOUND);
    }
    const invalidAssignment = await this.assignmentService.getAssigmentById(
      problem.assignmentId,
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

    return {
      message: 'Successfully Get Problem',
      data: problem,
    };
  }

  @ApiOperation({
    summary: 'Get All Problem By Assignment Id (Teacher, Student)',
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('assignment/:assignmentId')
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
    summary: 'Get Test Case Problem By Problem Id (Teacher, Student)',
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('testcase/:problemId')
  async getTestCaseProblemByProblemId(
    @Request() req: IRequest,
    @Param('problemId') problemId: string,
  ) {
    if (req.user.role !== Role.TEACHER && req.user.role !== Role.STUDENT) {
      throw new HttpException(
        'Do Not Have Permission(Teacher, Student)',
        HttpStatus.FORBIDDEN,
      );
    }

    const problem = await this.problemService.getProblemById(problemId);

    if (!problem) {
      throw new HttpException('Problem Not Found', HttpStatus.NOT_FOUND);
    }

    const invalidAssignment = await this.assignmentService.getAssigmentById(
      problem?.assignmentId as string,
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

    const testcase =
      await this.testcaseService.getTestCaseByProblemId(problemId);
    return {
      message: 'Get Test Case Successfully',
      data: testcase,
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

  @ApiOperation({
    summary: 'Add Test Case Problem By Problem Id (Teacher)',
  })
  @UseGuards(AuthGuard('jwt'))
  @Post('testcase')
  async addTestCaseProblemByProblemId(
    @Request() req: IRequest,
    @Body() createTestCaseDTO: CreateTestCaseDTO,
  ) {
    if (req.user.role !== Role.TEACHER) {
      throw new HttpException(
        'Do Not Have Permission(Teacher)',
        HttpStatus.FORBIDDEN,
      );
    }

    const problem = await this.problemService.getProblemById(
      createTestCaseDTO.problemId,
    );

    if (!problem) {
      throw new HttpException('Problem Not Found', HttpStatus.NOT_FOUND);
    }

    const invalidAssignment = await this.assignmentService.getAssigmentById(
      problem?.assignmentId as string,
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

    await this.testcaseService.createTestCaseByProblemId(createTestCaseDTO);
    return {
      message: 'Create Test Case Successfully',
    };
  }

  @ApiOperation({
    summary: 'Update Problem By Id (Teacher)',
  })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiConsumes('application/json')
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async updateProblemById(
    @Request() req: IRequest,
    @Body() updateProblemDTO: UpdateProblemDTO,
    @Param('id') id: string,
  ) {
    if (req.user.role !== Role.TEACHER) {
      throw new HttpException(
        'Do Not Have Permission(Teacher)',
        HttpStatus.FORBIDDEN,
      );
    }

    const invalidProblem = await this.problemService.getProblemById(id);

    const invalidAssignment = await this.assignmentService.getAssigmentById(
      invalidProblem?.assignmentId as string,
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

    const problem = await this.problemService.updateProblemById(
      id,
      updateProblemDTO,
    );
    return {
      message: 'Update Problem Successfully',
      data: problem,
    };
  }

  @ApiOperation({
    summary: 'Update Test Case Problem By Problem Id (Teacher)',
  })
  @UseGuards(AuthGuard('jwt'))
  @Patch('testcase/:problemId')
  async updateTestCaseProblemByProblemId(
    @Request() req: IRequest,
    @Body() updateTestCaseDTO: UpdateTestCaseDTO,
    @Param('problemId') problemId: string,
  ) {
    if (req.user.role !== Role.TEACHER) {
      throw new HttpException(
        'Do Not Have Permission(Teacher)',
        HttpStatus.FORBIDDEN,
      );
    }

    const invalidProblem = await this.problemService.getProblemById(problemId);

    const invalidAssignment = await this.assignmentService.getAssigmentById(
      invalidProblem?.assignmentId as string,
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
    await this.testcaseService.updateTestCaseByProblemId(
      problemId,
      updateTestCaseDTO,
    );
    return {
      message: 'Update Test Case Successfully',
    };
  }

  @ApiOperation({
    summary: 'Delete Problem By Id (Teacher)',
  })
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteProblemById(@Request() req: IRequest, @Param('id') id: string) {
    if (req.user.role !== Role.TEACHER) {
      throw new HttpException(
        'Do Not Have Permission(Teacher)',
        HttpStatus.FORBIDDEN,
      );
    }

    const invalidProblem = await this.problemService.getProblemById(id);

    const invalidAssignment = await this.assignmentService.getAssigmentById(
      invalidProblem?.assignmentId as string,
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

    const problem = await this.problemService.deleteProblemById(id);
    return {
      message: 'Delete Problem Successfully',
      data: problem,
    };
  }

  @ApiOperation({
    summary: 'Get Constraint Problem By Problem Id (Teacher, Student)',
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('constraint/:problemId')
  async getConstraintProblemByProblemId(
    @Request() req: IRequest,
    @Param('problemId') problemId: string,
  ) {
    if (req.user.role !== Role.TEACHER && req.user.role !== Role.STUDENT) {
      throw new HttpException(
        'Do Not Have Permission(Teacher, Student)',
        HttpStatus.FORBIDDEN,
      );
    }

    const problem = await this.problemService.getProblemById(problemId);

    if (!problem) {
      throw new HttpException('Problem Not Found', HttpStatus.NOT_FOUND);
    }

    const invalidAssignment = await this.assignmentService.getAssigmentById(
      problem?.assignmentId as string,
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

    const constraint =
      await this.constraintService.getConstraintByProblemId(problemId);
    return {
      message: 'Get Constraint Problem Successfully',
      data: constraint,
    };
  }

  @ApiOperation({
    summary: 'Add Constraint Problem By Problem Id (Teacher)',
  })
  @UseGuards(AuthGuard('jwt'))
  @Post('constraint')
  async addConstraintProblemByProblemId(
    @Request() req: IRequest,
    @Body() createConstrintDTO: CreateConstraintDTO,
  ) {
    if (req.user.role !== Role.TEACHER) {
      throw new HttpException(
        'Do Not Have Permission(Teacher)',
        HttpStatus.FORBIDDEN,
      );
    }

    const problem = await this.problemService.getProblemById(
      createConstrintDTO.problemId,
    );

    if (!problem) {
      throw new HttpException('Problem Not Found', HttpStatus.NOT_FOUND);
    }

    const invalidAssignment = await this.assignmentService.getAssigmentById(
      problem?.assignmentId as string,
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

    await this.constraintService.createConstraintByProblemId(
      createConstrintDTO,
    );
    return {
      message: 'Create Constraint Problem Successfully',
    };
  }

  @ApiOperation({
    summary: 'Update Constraint Problem By Problem Id (Teacher)',
  })
  @UseGuards(AuthGuard('jwt'))
  @Patch('constraint/:problemId')
  async updateConstraintProblemByProblemId(
    @Request() req: IRequest,
    @Body() updateConstraintDTO: UpdateConstraintDTO,
    @Param('problemId') problemId: string,
  ) {
    if (req.user.role !== Role.TEACHER) {
      throw new HttpException(
        'Do Not Have Permission(Teacher)',
        HttpStatus.FORBIDDEN,
      );
    }

    const invalidProblem = await this.problemService.getProblemById(problemId);

    const invalidAssignment = await this.assignmentService.getAssigmentById(
      invalidProblem?.assignmentId as string,
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
    await this.constraintService.updateConstraintByProblemId(
      problemId,
      updateConstraintDTO,
    );
    return {
      message: 'Update Constraint Problem Successfully',
    };
  }
}
