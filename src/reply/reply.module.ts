import { Module } from '@nestjs/common';
import { ReplyService } from './reply.service';

@Module({
  providers: [ReplyService],
})
export class ReplyModule {}
