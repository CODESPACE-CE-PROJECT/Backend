import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PermissionModule } from 'src/permission/permission.module';
import { CourseTeacherModule } from 'src/course-teacher/course-teacher.module';
import { CourseStudentModule } from 'src/course-student/course-student.module';
import { UserModule } from 'src/user/user.module';
import { MinioClientModule } from 'src/minio-client/minio-client.module';

@Module({
  imports: [
    PrismaModule,
    PermissionModule,
    CourseTeacherModule,
    CourseStudentModule,
    UserModule,
    MinioClientModule,
  ],
  providers: [CourseService],
  controllers: [CourseController],
  exports: [CourseService],
})
export class CourseModule {}
