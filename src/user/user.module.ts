import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SchoolModule } from 'src/school/school.module';
import { MinioClientModule } from 'src/minio-client/minio-client.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, SchoolModule, MinioClientModule, ConfigModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
