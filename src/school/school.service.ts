import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSchoolDTO } from './dto/createSchool.dto';
import { UpdateSchoolDTO } from './dto/updateSchool.dto';
import { CreatePermissionSchoolDTO } from './dto/createPermissionSchool.dto';
import { UpdatePermissionSchoolDTO } from './dto/upatePermissionSchool.dto';

@Injectable()
export class SchoolService {
  constructor(private prisma: PrismaService) {}

  async createSchool(createSchoolDTO: CreateSchoolDTO) {
    try {
      const school = await this.prisma.school.create({
        data: {
          schoolName: createSchoolDTO.schoolName,
        },
      });
      return school;
    } catch (error) {
      throw new Error('Error Create School');
    }
  }

  async getAllSchool() {
    try {
      const schools = await this.prisma.school.findMany({
        include: {
          permission: true,
        },
      });
      return schools;
    } catch (error) {
      throw new Error('Error Fetch School');
    }
  }

  async getSchoolById(id: string) {
    try {
      const school = await this.prisma.school.findUnique({
        where: {
          schoolId: id,
        },
        include: {
          permission: true,
        },
      });
      return school;
    } catch (error) {
      throw new Error('Error Fetch School');
    }
  }

  async getSchoolByName(schoolName: string) {
    try {
      const school = await this.prisma.school.findFirst({
        where: {
          schoolName: schoolName,
        },
        include: {
          permission: true,
        },
      });
      return school;
    } catch (error) {
      throw new Error('Can Not Fetch School');
    }
  }

  async updateSchoolById(id: string, updateSchoolDTO: UpdateSchoolDTO) {
    try {
      const school = await this.prisma.school.update({
        where: {
          schoolId: id,
        },
        data: {
          schoolName: updateSchoolDTO.schoolName,
        },
      });
      return school;
    } catch (error) {
      throw new Error('Error Update School');
    }
  }

  async deleteSchoolById(id: string) {
    try {
      const school = await this.prisma.school.delete({
        where: {
          schoolId: id,
        },
      });
      return school;
    } catch (error) {
      throw new Error('Error Delete School');
    }
  }

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
      const school = await this.getSchoolById(
        createPermissionSchoolDTO.schoolId,
      );
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
