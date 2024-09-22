import { Module } from '@nestjs/common';
import { CourseStudentService } from './course-student.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CourseStudentService],
  exports: [CourseStudentService],
})
export class CourseStudentModule {}
