import { Module } from '@nestjs/common';
import { ConstraintService } from './constraint.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ConstraintService],
  exports: [ConstraintService],
})
export class ConstraintModule {}
