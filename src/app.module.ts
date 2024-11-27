import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SchoolModule } from './school/school.module';
import { MinioClientModule } from './minio-client/minio-client.module';
import { CourseModule } from './course/course.module';
import { AnnounceModule } from './announce/announce.module';
import { AssignmentModule } from './assignment/assignment.module';
import { ProblemModule } from './problem/problem.module';
import { SubmissionModule } from './submission/submission.module';
import { CodeSpaceModule } from './code-space/code-space.module';
import { AppController } from './app.controller';
import { PermissionModule } from './permission/permission.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    SchoolModule,
    MinioClientModule,
    PermissionModule,
    CourseModule,
    AnnounceModule,
    AssignmentModule,
    ProblemModule,
    SubmissionModule,
    CodeSpaceModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
