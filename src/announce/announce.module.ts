import { Module } from '@nestjs/common';
import { AnnounceService } from './announce.service';
import { AnnounceController } from './announce.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ReplyModule } from 'src/reply/reply.module';
import { UtilsModule } from 'src/utils/utils.module';
import { CourseModule } from 'src/course/course.module';

@Module({
  imports: [PrismaModule, ReplyModule, UtilsModule, CourseModule],
  controllers: [AnnounceController],
  providers: [AnnounceService],
})
export class AnnounceModule {}
