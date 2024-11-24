import { Module } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { AssignmentController } from './assignment.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CourseModule } from 'src/course/course.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, CourseModule, ConfigModule],
  controllers: [AssignmentController],
  providers: [AssignmentService],
  exports: [AssignmentService],
})
export class AssignmentModule {}
