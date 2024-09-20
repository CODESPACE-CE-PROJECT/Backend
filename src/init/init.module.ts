import { Module } from '@nestjs/common';
import { InitService } from './init.service';
import { InitController } from './init.controller';
import { UserModule } from 'src/user/user.module';
import { SchoolModule } from 'src/school/school.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UserModule, SchoolModule, ConfigModule],
  controllers: [InitController],
  providers: [InitService],
})
export class InitModule {}
