import { Module } from '@nestjs/common';
import { AnnounceService } from './announce.service';
import { AnnounceController } from './announce.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CourseStudentModule } from 'src/course-student/course-student.module';
import { CourseTeacherModule } from 'src/course-teacher/course-teacher.module';
import { ReplyModule } from 'src/reply/reply.module';

@Module({
  imports: [
    PrismaModule,
    CourseStudentModule,
    CourseTeacherModule,
    ReplyModule,
  ],
  controllers: [AnnounceController],
  providers: [AnnounceService],
})
export class AnnounceModule {}
