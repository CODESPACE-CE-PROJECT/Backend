import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SchoolModule } from 'src/school/school.module';

@Module({
  imports: [PrismaModule, SchoolModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
