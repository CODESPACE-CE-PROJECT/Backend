import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CourseTeacherService {
  constructor(private readonly prisma: PrismaService) {}

  async getCourseTeacherById(id: string) {
    try {
      const courseTeacher = await this.prisma.courseTeacher.findUnique({
        where: {
          courseTeachertId: id,
        },
      });
      return courseTeacher;
    } catch (error) {
      throw new Error('Can Not Fetch Course Student');
    }
  }
  async getTeacherByCourseId(courseId: string) {
    try {
      const teachers = await this.prisma.courseTeacher.findMany({
        where: {
          courseId: courseId,
        },
        include: {
          user: true,
        },
        omit: {
          courseId: true,
          courseTeachertId: true,
        },
      });
      return teachers;
    } catch (error) {
      throw new Error('Can Not Fetch Teacher In Course');
    }
  }

  async getCourseIdByUsername(username: string) {
    try {
      const course = await this.prisma.courseTeacher.findMany({
        where: {
          username: username,
        },
      });
      return course;
    } catch (error) {
      throw new Error('Can Not Fetch Course Id');
    }
  }

  async getCourseTeacherByUsernameAndCourseId(
    username: string,
    courseId: string,
  ) {
    try {
      const courseTeacher = await this.prisma.courseTeacher.findFirst({
        where: {
          username: username,
          courseId: courseId,
        },
      });
      return courseTeacher;
    } catch (error) {
      throw new Error('Error Fetch Course Student');
    }
  }

  async addTeacherToCourse(username: string, courseId: string) {
    try {
      const user = await this.prisma.courseTeacher.create({
        data: {
          courseId: courseId,
          username: username,
        },
      });
      return user;
    } catch (error) {
      throw new Error('Error Add Teacher To Course');
    }
  }

  async deletTeacherFromCourse(id: string) {
    try {
      const user = await this.prisma.courseTeacher.delete({
        where: {
          courseTeachertId: id,
        },
      });
      return user;
    } catch (error) {
      throw new error('Can Not Delete Teacher From Course');
    }
  }
}
