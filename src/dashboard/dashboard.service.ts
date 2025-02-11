import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getInfoDashboard() {
    try {
      const count = await this.getCountSchoolAndUserCount();
      const months = await this.getSchoolAndUserFromMonth();
      const province = await this.getSchoolAndUserFromProvince();
      return {
        count: count,
        months: months,
        province: province,
      };
    } catch (error) {
      throw new Error('Error Fetch Info Dashboard');
    }
  }

  async getCountSchoolAndUserCount() {
    try {
      const schoolCount = await this.prisma.school.count({
        where: {
          NOT: {
            schoolName: 'ADMIN',
          },
        },
      });
      const users = await this.prisma.users.findMany({
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
  private async getSchoolAndUserFromProvince() {
    try {
      const schools = await this.prisma.school.findMany({
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

  private async getSchoolAndUserFromMonth() {
    try {
      const now = new Date();
      const sixMonthsAgo = subMonths(now, 6);

      const schools = await this.prisma.school.findMany({
        where: {
          createdAt: { gte: sixMonthsAgo },
          NOT: { schoolName: 'ADMIN' },
        },
        select: { createdAt: true },
      });

      const users = await this.prisma.users.findMany({
        where: {
          createdAt: { gte: sixMonthsAgo },
          NOT: { role: Role.ADMIN },
        },
        select: { createdAt: true, role: true },
      });

      // Thai month names
      const thaiMonths = [
        'ม.ค.',
        'ก.พ.',
        'มี.ค.',
        'เม.ย.',
        'พ.ค.',
        'มิ.ย.',
        'ก.ค.',
        'ส.ค.',
        'ก.ย.',
        'ต.ค.',
        'พ.ย.',
        'ธ.ค.',
      ];

      const monthlyData: {
        month: string;
        school: number;
        student: number;
        teacher: number;
      }[] = [];

      for (let i = 0; i < 6; i++) {
        const monthStart = startOfMonth(subMonths(now, i));
        const monthEnd = endOfMonth(subMonths(now, i));

        const thaiYear = monthStart.getFullYear() + 543;
        const monthName = `${thaiMonths[monthStart.getMonth()]} ${thaiYear}`;

        const schoolCount = schools.filter(
          (school) =>
            school.createdAt >= monthStart && school.createdAt <= monthEnd,
        ).length;

        const studentCount = users.filter(
          (user) =>
            user.role === Role.STUDENT &&
            user.createdAt >= monthStart &&
            user.createdAt <= monthEnd,
        ).length;

        const teacherCount = users.filter(
          (user) =>
            user.role === Role.TEACHER &&
            user.createdAt >= monthStart &&
            user.createdAt <= monthEnd,
        ).length;

        monthlyData.unshift({
          month: monthName,
          school: schoolCount,
          student: studentCount,
          teacher: teacherCount,
        });
      }

      return monthlyData;
    } catch (error) {
      throw new Error('Error Fetch Data');
    }
  }
}
