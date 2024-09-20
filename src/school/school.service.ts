import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSchoolDTO } from './dto/createSchool.dto';
import { UpdateSchoolDTO } from './dto/updateSchool.dto';

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
}
