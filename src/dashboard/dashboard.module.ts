import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UtilsModule } from 'src/utils/utils.module';

@Module({
  imports: [PrismaModule, UtilsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
