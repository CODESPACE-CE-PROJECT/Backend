import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSchoolDTO } from './dto/createSchool.dto';
import { UpdateSchoolDTO } from './dto/updateSchool.dto';
import { MinioClientService } from 'src/minio-client/minio-client.service';
import { Role } from '@prisma/client';

@Injectable()
export class SchoolService {
  constructor(
    private prisma: PrismaService,
    private minio: MinioClientService,
  ) {}

  async createSchool(createSchoolDTO: CreateSchoolDTO) {
    try {
      let imageUrl = null;
      if (createSchoolDTO.picture) {
        imageUrl = await this.minio.uploadFile(
          'school',
          createSchoolDTO.picture,
          '',
        );
      }

      const school = await this.prisma.school.create({
        include: {
          permission: true,
        },
        data: {
          schoolName: createSchoolDTO.schoolName,
          pictureUrl: imageUrl?.fileUrl,
          package: createSchoolDTO.package,
          address: createSchoolDTO.address,
          subDistrict: createSchoolDTO.subDistrict,
          district: createSchoolDTO.district,
          province: createSchoolDTO.province,
          postCode: createSchoolDTO.postCode,
          permission: {
            create: {
              maxCreateTeacher: createSchoolDTO.maxCreateCoursePerTeacher,
              maxCreateStudent: createSchoolDTO.maxCreateStudent,
              maxCreateCoursePerTeacher:
                createSchoolDTO.maxCreateCoursePerTeacher,
              canCreateUser: createSchoolDTO.canCreateUser,
              canUpdateUser: createSchoolDTO.canUpdateUser,
              canDeleteUser: createSchoolDTO.canDeleteUser,
            },
          },
        },
      });
      return school;
    } catch (error) {
      console.log(error);
      throw new Error('Error Create School');
    }
  }

  async getAllSchool() {
    try {
      const schools = await this.prisma.school.findMany({
        where: {
          NOT: {
            schoolName: 'ADMIN',
          },
          isEnable: true,
        },
        include: {
          permission: true,
          users: true,
        },
      });
      const updateSchool = schools.map((school) => {
        const teacherCount = school.users.filter(
          (user) => user.role === Role.TEACHER && user.isEnable,
        );
        const studentCount = school.users.filter(
          (user) => user.role === Role.STUDENT && user.isEnable,
        );

        if (school) {
          Reflect.deleteProperty(school, 'users');
        }

        return {
          ...school,
          count: {
            student: studentCount.length,
            teacher: teacherCount.length,
          },
        };
      });
      return updateSchool;
    } catch (error) {
      throw new Error('Error Fetch School');
    }
  }

  async getCourseBySchoolId(schoolId: string) {
    try {
      const courses = await this.prisma.school.findMany({
        where: {
          schoolId: schoolId,
        },
        select: {
          courses: true,
        },
      });
      return courses;
    } catch (error) {
      throw new Error('Can Not Fetch Course');
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
          users: {
            where: {
              isEnable: true,
            },
            omit: {
              hashedPassword: true,
            },
          },
        },
      });
      return school;
    } catch (error) {
      throw new Error('Error Fetch School');
    }
  }

  async getSchoolBySchoolName(schoolName: string) {
    try {
      const school = await this.prisma.school.findFirst({
        where: {
          schoolName: schoolName,
        },
      });
      return school;
    } catch (error) {
      throw new Error('Error Fetch School');
    }
  }

  async getDisableSchoolAndUser() {
    try {
      const school = await this.prisma.school.findMany({
        where: {
          isEnable: false,
        },
      });
      const user = await this.prisma.users.findMany({
        where: {
          isEnable: false,
        },
      });
      return {
        school: school,
        user: user,
      };
    } catch (error) {
      throw new Error('Error Fetch Data');
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

  async getPeopleById(id: string) {
    try {
      const school = await this.prisma.school.findFirst({
        where: {
          schoolId: id,
          NOT: {
            isEnable: false,
          },
        },
        select: {
          users: true,
        },
      });
      return school;
    } catch (error) {
      throw new Error('Can Not Fetch School');
    }
  }

  async updateSchoolById(id: string, updateSchoolDTO: UpdateSchoolDTO) {
    try {
      let imageUrl = null;
      if (updateSchoolDTO.picture) {
        imageUrl = await this.minio.uploadFile(
          'profile',
          updateSchoolDTO.picture,
          '',
        );
      }

      const school = await this.prisma.school.update({
        include: {
          permission: true,
        },
        where: {
          schoolId: id,
        },
        data: {
          schoolName: updateSchoolDTO?.schoolName,
          pictureUrl: imageUrl?.fileUrl,
          package: updateSchoolDTO?.package,
          address: updateSchoolDTO?.address,
          subDistrict: updateSchoolDTO?.subDistrict,
          district: updateSchoolDTO?.district,
          province: updateSchoolDTO?.province,
          postCode: updateSchoolDTO?.postCode,
          isEnable: updateSchoolDTO.isEnable,
          permission: {
            update: {
              maxCreateTeacher: updateSchoolDTO.maxCreateTeacher,
              maxCreateStudent: updateSchoolDTO.maxCreateStudent,
              maxCreateCoursePerTeacher:
                updateSchoolDTO.maxCreateCoursePerTeacher,
              canCreateUser: updateSchoolDTO.canCreateUser,
              canUpdateUser: updateSchoolDTO.canUpdateUser,
              canDeleteUser: updateSchoolDTO.canDeleteUser,
            },
          },
        },
      });

      if (updateSchoolDTO.isEnable) {
        await this.prisma.users.updateMany({
          where: {
            schoolId: id,
          },
          data: {
            isEnable: updateSchoolDTO.isEnable,
          },
        });
      }

      return school;
    } catch (error) {
      console.log(error);
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
}
