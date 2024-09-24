import { Module } from '@nestjs/common';
import { ProblemService } from './problem.service';
import { ProblemController } from './problem.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AssignmentModule } from 'src/assignment/assignment.module';
import { CourseStudentModule } from 'src/course-student/course-student.module';
import { CourseTeacherModule } from 'src/course-teacher/course-teacher.module';
import { CourseModule } from 'src/course/course.module';

@Module({
  imports: [
    PrismaModule,
    AssignmentModule,
    CourseModule,
    CourseStudentModule,
    CourseTeacherModule,
  ],
  controllers: [ProblemController],
  providers: [ProblemService],
})
export class ProblemModule {}
