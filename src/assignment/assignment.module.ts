import { Module } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { AssignmentController } from './assignment.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CourseModule } from 'src/course/course.module';
import { UtilsModule } from 'src/utils/utils.module';

@Module({
  imports: [PrismaModule, CourseModule, UtilsModule],
  controllers: [AssignmentController],
  providers: [AssignmentService],
  exports: [AssignmentService],
})
export class AssignmentModule {}
