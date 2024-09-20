import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PermissionService],
  exports: [PermissionService],
})
export class PermissionModule {}
