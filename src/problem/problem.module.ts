import { Module } from '@nestjs/common';
import { ProblemService } from './problem.service';
import { ProblemController } from './problem.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AssignmentModule } from 'src/assignment/assignment.module';
import { UtilsModule } from 'src/utils/utils.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, AssignmentModule, UtilsModule, ConfigModule],
  controllers: [ProblemController],
  providers: [ProblemService],
  exports: [ProblemService],
})
export class ProblemModule {}
