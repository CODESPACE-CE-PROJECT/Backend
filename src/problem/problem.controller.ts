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
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProblemService } from './problem.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IRequest } from 'src/auth/interface/request.interface';
import { AssignmentService } from 'src/assignment/assignment.service';
import { CreateProblemDTO } from './dto/createProblemDTO.dto';
import { Role } from '@prisma/client';
import { UpdateProblemDTO } from './dto/updateProblemDTO.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UtilsService } from 'src/utils/utils.service';
import { ConfigService } from '@nestjs/config';

@ApiBearerAuth()
@ApiTags('Problem')
@Controller('problem')
export class ProblemController {
  constructor(
    private readonly problemService: ProblemService,
    private readonly assignmentService: AssignmentService,
    private readonly utilsService: UtilsService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({
    summary: 'Get Problem By Id (Teacher, Student)',
  })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getProblemById(
    @Request() req: IRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const problem = await this.problemService.getProblemById(
      id,
      req.user.username,
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

    if (problem) {
      Reflect.deleteProperty(problem, 'assignment');
    }

    return {
      message: 'Successfully Get Problem',
      data: problem,
    };
  }

  @ApiOperation({
    summary: 'Get Test Case Problem By Problem Id (Teacher, Student)',
  })
  @UseGuards(JwtAuthGuard)
  @Get(':id/testcase')
  async getTestCaseProblemByProblemId(
    @Request() req: IRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const problem = await this.problemService.getProblemById(id);

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

    const testcase =
      await this.problemService.getTestCaseAndConstraintByProblemId(id);
    return {
      message: 'Get Test Case Successfully',
      data: testcase,
    };
  }

  @ApiOperation({
    summary: 'Create Problem By Assignment Id (Teacher)',
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  async createProblemByAssignmentId(
    @Request() req: IRequest,
    @Body() createProblemDTO: CreateProblemDTO,
  ) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.TEACHER,
    ]);

    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }

    const validAssignment = await this.assignmentService.getAssignmentById(
      createProblemDTO.assignmentId,
    );

    if (!validAssignment) {
      throw new HttpException('Assignemnt Not Found', HttpStatus.NOT_FOUND);
    }

    const teacher = validAssignment.course.courseTeacher.find(
      (teacher) => teacher.username == req.user.username,
    );

    if (!teacher) {
      throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
    }

    const count = await this.problemService.countProblemByAssignmentId(
      createProblemDTO.assignmentId,
    );

    if (
      createProblemDTO.problem.length + count >
      this.configService.getOrThrow('PROBLEM_LIMIT')
    ) {
      throw new HttpException(
        `Can not Create Over ${this.configService.getOrThrow('PROBLEM_LIMIT')}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const problem =
      await this.problemService.createProblemByAssignmentId(createProblemDTO);
    return {
      message: 'Create Problem Successfully',
      data: problem,
    };
  }

  @ApiOperation({
    summary: 'Update Problem By Id (Teacher)',
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateProblemById(
    @Request() req: IRequest,
    @Body() updateProblemDTO: UpdateProblemDTO,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.TEACHER,
    ]);

    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }

    const validProblem = await this.problemService.getProblemById(id);

    if (!validProblem) {
      throw new HttpException('Problem Not Found', HttpStatus.NOT_FOUND);
    }

    const teacher = validProblem.assignment?.course.courseTeacher.find(
      (teacher) => teacher.username === req.user.username,
    );

    if (!teacher) {
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
    summary: 'Delete Problem By Id (Teacher)',
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteProblemById(
    @Request() req: IRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.TEACHER,
    ]);

    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }

    const validProblem = await this.problemService.getProblemById(id);

    if (!validProblem) {
      throw new HttpException('Problem Not Found', HttpStatus.NOT_FOUND);
    }

    const teacher = validProblem.assignment?.course.courseTeacher.find(
      (teacher) => teacher.username === req.user.username,
    );

    if (!teacher) {
      throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
    }

    const problem = await this.problemService.deleteProblemById(id);
    return {
      message: 'Delete Problem Successfully',
      data: problem,
    };
  }
}
