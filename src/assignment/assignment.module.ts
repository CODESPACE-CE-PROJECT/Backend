import { Module } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { AssignmentController } from './assignment.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CourseStudentModule } from 'src/course-student/course-student.module';
import { CourseTeacherModule } from 'src/course-teacher/course-teacher.module';

@Module({
  imports: [PrismaModule, CourseStudentModule, CourseTeacherModule],
  controllers: [AssignmentController],
  providers: [AssignmentService],
})
export class AssignmentModule {}
