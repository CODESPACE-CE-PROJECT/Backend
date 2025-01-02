import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SchoolModule } from 'src/school/school.module';
import { MinioClientModule } from 'src/minio-client/minio-client.module';
import { ConfigModule } from '@nestjs/config';
import { UtilsModule } from 'src/utils/utils.module';
import { MailerModule } from 'src/mailer/mailer.module';

@Module({
  imports: [
    MailerModule,
    PrismaModule,
    SchoolModule,
    MinioClientModule,
    ConfigModule,
    UtilsModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
