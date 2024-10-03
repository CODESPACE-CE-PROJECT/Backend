import { Module } from '@nestjs/common';
import { CodeSpaceService } from './code-space.service';
import { CodeSpaceController } from './code-space.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CodeSpaceController],
  providers: [CodeSpaceService],
})
export class CodeSpaceModule {}
