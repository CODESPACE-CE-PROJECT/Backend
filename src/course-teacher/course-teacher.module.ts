import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CourseTeacherService } from './course-teacher.service';

@Module({
  imports: [PrismaModule],
  providers: [CourseTeacherService],
  exports: [CourseTeacherService],
})
export class CourseTeacherModule {}
