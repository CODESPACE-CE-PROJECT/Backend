import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}
  async getPermissionBySchoolId(schoolId: string) {
    try {
      const permission = await this.prisma.permission.findFirst({
        where: {
          schoolId: schoolId,
        },
      });
      return permission;
    } catch (error) {
      throw new Error('Error Fetch Permission School');
    }
  }
}
