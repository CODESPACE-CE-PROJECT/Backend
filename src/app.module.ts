import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SchoolModule } from './school/school.module';
import { MinioClientModule } from './minio-client/minio-client.module';
import { PermissionModule } from './permission/permission.module';
import { CourseModule } from './course/course.module';
import { CourseStudentModule } from './course-student/course-student.module';
import { CourseTeacherModule } from './course-teacher/course-teacher.module';
import { AnnounceModule } from './announce/announce.module';
import { ReplyModule } from './reply/reply.module';
import { AssignmentModule } from './assignment/assignment.module';
import { ProblemModule } from './problem/problem.module';
import { SubmissionModule } from './submission/submission.module';
import { CodeSpaceModule } from './code-space/code-space.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    //UserModule,
    AuthModule,
    SchoolModule,
    MinioClientModule,
    //PermissionModule,
    //CourseModule,
    //CourseStudentModule,
    //CourseTeacherModule,
    //AnnounceModule,
    //ReplyModule,
    //AssignmentModule,
    //ProblemModule,
    //SubmissionModule,
    //CodeSpaceModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
