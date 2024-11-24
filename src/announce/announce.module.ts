import { Module } from '@nestjs/common';
import { AnnounceService } from './announce.service';
import { AnnounceController } from './announce.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ReplyModule } from 'src/reply/reply.module';

@Module({
  imports: [PrismaModule, ReplyModule],
  controllers: [AnnounceController],
  providers: [AnnounceService],
})
export class AnnounceModule {}
