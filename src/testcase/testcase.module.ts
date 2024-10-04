import { Module } from '@nestjs/common';
import { TestcaseService } from './testcase.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TestcaseService],
  exports: [TestcaseService],
})
export class TestcaseModule {}
