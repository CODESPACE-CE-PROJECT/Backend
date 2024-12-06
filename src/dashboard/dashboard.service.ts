import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prima: PrismaService) {}

  async getInfoDashboard() {
    try {
      const count = await this.getCountSchoolAndUserCount();
      const province = await this.getSchoolAndUserFromProvince();
      return {
        count: count,
        province: province,
      };
    } catch (error) {
      throw new Error('Error Fetch Info Dashboard');
    }
  }

  async getCountSchoolAndUserCount() {
    try {
      const schoolCount = await this.prima.school.count({
        where: {
          NOT: {
            schoolName: 'ADMIN',
          },
        },
      });
      const users = await this.prima.users.findMany({
        where: {
          NOT: {
            role: Role.ADMIN,
          },
        },
      });

      const teacherCount = users.filter(
        (user) => user.role === Role.TEACHER,
      ).length;
      const studentCount = users.filter(
        (user) => user.role === Role.STUDENT,
      ).length;

      return {
        school: schoolCount,
        teacher: teacherCount,
        student: studentCount,
        totalUser: teacherCount + studentCount,
      };
    } catch (error) {
      throw new Error('Error Fetch Count');
    }
  }

  async getSchoolAndUserFromProvince() {
    try {
      const schools = await this.prima.school.findMany({
        where: {
          NOT: {
            schoolName: 'ADMIN',
          },
        },
        select: {
          users: true,
          province: true,
        },
      });

      const resultProvince: {
        provinceName: string | null;
        school: number;
        student: number;
        teacher: number;
      }[] = [];

      schools.forEach((school) => {
        let provinceEntry = resultProvince.find(
          (item) => item.provinceName === school.province,
        ) || {
          provinceName: school.province,
          school: 0,
          student: 0,
          teacher: 0,
        };

        if (!resultProvince.includes(provinceEntry)) {
          resultProvince.push(provinceEntry);
        }

        provinceEntry.school++;

        school.users.forEach((user) => {
          if (user.role === Role.STUDENT) {
            provinceEntry.student++;
          } else if (user.role === Role.TEACHER) {
            provinceEntry.teacher++;
          }
        });
      });

      return resultProvince;
    } catch (error) {
      throw new Error('Erro Fetch Data');
    }
  }
}
