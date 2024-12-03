import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSchoolDTO } from './dto/createSchool.dto';
import { UpdateSchoolDTO } from './dto/updateSchool.dto';
import { MinioClientService } from 'src/minio-client/minio-client.service';

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
        imageUrl = await this.minio.uploadImage(
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
          pictureUrl: imageUrl?.imageUrl,
          package: createSchoolDTO.package,
          address: createSchoolDTO.address,
          subDistrict: createSchoolDTO.subdistrict,
          district: createSchoolDTO.district,
          province: createSchoolDTO.province,
          postCode: createSchoolDTO.postCode,
          permission: {
            create: {
              maxCreateTeacher: parseInt(
                createSchoolDTO.maxCreateTeacher.toString(),
                10,
              ),
              maxCreateStudent: parseInt(
                createSchoolDTO.maxCreateStudent.toString(),
                10,
              ),
              maxCreateCoursePerTeacher: parseInt(
                createSchoolDTO.maxCreateCoursePerTeacher.toString(),
                10,
              ),
              canCreateUser: createSchoolDTO.canCateaUser.toString() === 'true',
              canUpdateUser:
                createSchoolDTO.canUpdateUser.toString() === 'true',
              canDeleteUser:
                createSchoolDTO.canDeleteUser.toString() === 'true',
            },
          },
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

  async getPeopleById(id: string) {
    try {
      const school = await this.prisma.school.findFirst({
        where: {
          schoolId: id,
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
        imageUrl = await this.minio.uploadImage(
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
          schoolName: updateSchoolDTO.schoolName,
          pictureUrl: imageUrl?.imageUrl,
          package: updateSchoolDTO.package,
          address: updateSchoolDTO.address,
          subDistrict: updateSchoolDTO.subdistrict,
          district: updateSchoolDTO.district,
          province: updateSchoolDTO.province,
          postCode: updateSchoolDTO.postCode,
          isEnable: updateSchoolDTO.isEnable.toString() === 'true',
          permission: {
            update: {
              maxCreateTeacher: parseInt(
                updateSchoolDTO.maxCreateTeacher.toString(),
                10,
              ),
              maxCreateStudent: parseInt(
                updateSchoolDTO.maxCreateStudent.toString(),
                10,
              ),
              maxCreateCoursePerTeacher: parseInt(
                updateSchoolDTO.maxCreateCoursePerTeacher.toString(),
                10,
              ),
              canCreateUser: updateSchoolDTO.canCateaUser.toString() === 'true',
              canUpdateUser:
                updateSchoolDTO.canUpdateUser.toString() === 'true',
              canDeleteUser:
                updateSchoolDTO.canDeleteUser.toString() === 'true',
            },
          },
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
}
