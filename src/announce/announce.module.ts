import { Module } from '@nestjs/common';
import { AnnounceService } from './announce.service';
import { AnnounceController } from './announce.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CourseStudentModule } from 'src/course-student/course-student.module';
import { CourseTeacherModule } from 'src/course-teacher/course-teacher.module';

@Module({
  imports: [PrismaModule, CourseStudentModule, CourseTeacherModule],
  controllers: [AnnounceController],
  providers: [AnnounceService],
})
export class AnnounceModule {}
