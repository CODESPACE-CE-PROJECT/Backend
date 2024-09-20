import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePermissionSchoolDTO } from './dto/createPermissionSchool.dto';
import { UpdatePermissionSchoolDTO } from './dto/upatePermissionSchool.dto';

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

  async createPermisssionSchoolById(
    createPermissionSchoolDTO: CreatePermissionSchoolDTO,
  ) {
    try {
      await this.prisma.permission.create({
        data: {
          schoolId: createPermissionSchoolDTO.schoolId,
          maxCreateStudent: createPermissionSchoolDTO.maxCreateStudent,
          maxCreateTeacher: createPermissionSchoolDTO.maxCreateTeacher,
          maxCreateCoursePerTeacher:
            createPermissionSchoolDTO.maxCreateCoursePerTeacher,
          canCreateUser: createPermissionSchoolDTO.canCateaUsers,
          canUpdateUser: createPermissionSchoolDTO.canUpdateUsers,
          canDeleteUser: createPermissionSchoolDTO.canDeleteUsers,
        },
      });
      const school = await this.prisma.school.findFirst({
        where: {
          schoolId: createPermissionSchoolDTO.schoolId,
        },
      });
      return school;
    } catch (error) {
      throw new Error('Error Create Permission School');
    }
  }

  async updatePermissionSchoolById(
    updatePermissionSchoolDTO: UpdatePermissionSchoolDTO,
    permissionId: string,
  ) {
    try {
      const permission = await this.prisma.permission.update({
        where: {
          permissionId: permissionId,
        },
        data: {
          maxCreateTeacher: updatePermissionSchoolDTO.maxCreateTeacher,
          maxCreateStudent: updatePermissionSchoolDTO.maxCreateStudent,
          maxCreateCoursePerTeacher:
            updatePermissionSchoolDTO.maxCreateCoursePerTeacher,
          canCreateUser: updatePermissionSchoolDTO.canCateaUsers,
          canUpdateUser: updatePermissionSchoolDTO.canUpdateUsers,
          canDeleteUser: updatePermissionSchoolDTO.canDeleteUsers,
        },
      });
      return permission;
    } catch (error) {
      throw new Error('Error Update Permission School');
    }
  }

  async deletePermissionSchoolByPermisssionId(
    permissionId: string | undefined,
  ) {
    try {
      await this.prisma.permission.delete({
        where: {
          permissionId: permissionId,
        },
      });
    } catch (err) {
      throw new Error('Can Not Delete Permission School');
    }
  }
}
