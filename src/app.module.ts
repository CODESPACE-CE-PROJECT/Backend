import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SchoolModule } from './school/school.module';
import { MinioClientModule } from './minio-client/minio-client.module';
import { InitModule } from './init/init.module';
import { PermissionModule } from './permission/permission.module';
import { CourseModule } from './course/course.module';
import { CourseStudentModule } from './course-student/course-student.module';
import { CourseTeacherModule } from './course-teacher/course-teacher.module';
import { AnnounceModule } from './announce/announce.module';
import { ReplyModule } from './reply/reply.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UserModule,
    AuthModule,
    SchoolModule,
    MinioClientModule,
    InitModule,
    PermissionModule,
    CourseModule,
    CourseStudentModule,
    CourseTeacherModule,
    AnnounceModule,
    ReplyModule,
  ],
})
export class AppModule {}
