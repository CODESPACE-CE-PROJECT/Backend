import { Module } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { SubmissionController } from './submission.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProblemModule } from 'src/problem/problem.module';
import { UtilsModule } from 'src/utils/utils.module';

@Module({
  imports: [PrismaModule, ProblemModule, UtilsModule],
  controllers: [SubmissionController],
  providers: [SubmissionService],
})
export class SubmissionModule {}
