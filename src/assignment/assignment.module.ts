import { Module } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { AssignmentController } from './assignment.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CourseStudentModule } from 'src/course-student/course-student.module';
import { CourseTeacherModule } from 'src/course-teacher/course-teacher.module';
import { CourseModule } from 'src/course/course.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    CourseStudentModule,
    CourseTeacherModule,
    CourseModule,
    ConfigModule,
  ],
  controllers: [AssignmentController],
  providers: [AssignmentService],
  exports: [AssignmentService],
})
export class AssignmentModule {}
