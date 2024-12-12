import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PermissionModule } from 'src/permission/permission.module';
import { UserModule } from 'src/user/user.module';
import { MinioClientModule } from 'src/minio-client/minio-client.module';
import { UtilsModule } from 'src/utils/utils.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    PrismaModule,
    PermissionModule,
    UserModule,
    MinioClientModule,
    UtilsModule,
    NotificationModule,
  ],
  providers: [CourseService],
  controllers: [CourseController],
  exports: [CourseService],
})
export class CourseModule {}
