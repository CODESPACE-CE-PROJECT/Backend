import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PermissionModule } from 'src/permission/permission.module';
import { CourseTeacherModule } from 'src/course-teacher/course-teacher.module';
import { CourseStudentModule } from 'src/course-student/course-student.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    PrismaModule,
    PermissionModule,
    CourseTeacherModule,
    CourseStudentModule,
    UserModule,
  ],
  providers: [CourseService],
  controllers: [CourseController],
})
export class CourseModule {}
