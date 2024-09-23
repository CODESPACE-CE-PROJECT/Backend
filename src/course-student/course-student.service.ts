import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CourseStudentService {
  constructor(private readonly prisma: PrismaService) {}

  async getCourseStudentById(id: string) {
    try {
      const courseStudent = await this.prisma.courseStudent.findUnique({
        where: {
          courseStudentId: id,
        },
      });
      return courseStudent;
    } catch (error) {
      throw new Error('Can Not Fetch Course Student');
    }
  }

  async getStudentByCourseId(courseId: string) {
    try {
      const students = await this.prisma.courseStudent.findMany({
        where: {
          courseId: courseId,
        },
      });
      return students;
    } catch (error) {
      throw new Error('Error Fetch Student In Course');
    }
  }

  async getCourseIdByUsername(username: string) {
    try {
      const course = await this.prisma.courseStudent.findMany({
        where: {
          username: username,
        },
      });
      return course;
    } catch (error) {
      throw new Error('Error Fetch Course Id');
    }
  }

  async getCourseStudentByUsernameAndCourseId(
    username: string,
    courseId: string,
  ) {
    try {
      const courseStudent = await this.prisma.courseStudent.findFirst({
        where: {
          username: username,
          courseId: courseId,
        },
      });
      return courseStudent;
    } catch (error) {
      throw new Error('Error Fetch Course Student');
    }
  }

  async addStudentToCourse(username: string, courseId: string) {
    try {
      const user = await this.prisma.courseStudent.create({
        data: {
          courseId: courseId,
          username: username,
        },
      });
      return user;
    } catch (error) {
      throw new Error('Error Add Student To Course');
    }
  }

  async deleteStudentFromCourse(id: string) {
    try {
      const user = await this.prisma.courseStudent.delete({
        where: {
          courseStudentId: id,
        },
      });
      return user;
    } catch (error) {
      throw new error('Can Not Delete Student From Course');
    }
  }
}
