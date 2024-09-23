import { Module } from '@nestjs/common';
import { ReplyService } from './reply.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ReplyService],
  exports: [ReplyService],
})
export class ReplyModule {}
