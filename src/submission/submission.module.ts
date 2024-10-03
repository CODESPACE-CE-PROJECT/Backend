import { Module } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { SubmissionController } from './submission.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProblemModule } from 'src/problem/problem.module';
import { AssignmentModule } from 'src/assignment/assignment.module';
import { CourseModule } from 'src/course/course.module';
import { CourseStudentModule } from 'src/course-student/course-student.module';
import { CourseTeacherModule } from 'src/course-teacher/course-teacher.module';

@Module({
  imports: [
    PrismaModule,
    ProblemModule,
    AssignmentModule,
    CourseModule,
    CourseStudentModule,
    CourseTeacherModule,
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService],
})
export class SubmissionModule {}
