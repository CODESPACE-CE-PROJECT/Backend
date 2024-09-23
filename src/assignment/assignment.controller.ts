import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IRequest } from 'src/auth/interface/request.interface';
import { CourseStudentService } from 'src/course-student/course-student.service';
import { CourseTeacherService } from 'src/course-teacher/course-teacher.service';

@ApiTags('Assignment')
@Controller('assignment')
export class AssignmentController {
  constructor(
    private readonly assignmentService: AssignmentService,
    private readonly courseStudentService: CourseStudentService,
    private readonly courseTeacherService: CourseTeacherService,
  ) {}

  @ApiOperation({
    summary: 'Get All Assignment By Course Id (Admin,Teacher, Student)',
  })
  @UseGuards(AuthGuard('jwt'))
  @Get(':courseId')
  async getAssignmentByCourseId(
    @Request() req: IRequest,
    @Param('courseId') courseId: string,
  ) {
    const assignment =
      await this.assignmentService.getAssigmentByCourseId(courseId);
  }
}
