import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCourseDTO } from './dto/createCourse.dto';
import { UpdateCourseDTO } from './dto/updateCourse.dto';
import { CourseTeacherService } from 'src/course-teacher/course-teacher.service';
import { CourseStudentService } from 'src/course-student/course-student.service';
import { Course, Role } from '@prisma/client';
import { AddUserToCourseDTO } from './dto/addUserToCourse.dto';
import { MinioClientService } from 'src/minio-client/minio-client.service';

@Injectable()
export class CourseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly courseTeacherService: CourseTeacherService,
    private readonly courseStudentService: CourseStudentService,
    private readonly minio: MinioClientService,
  ) {}

  async getAllCourse() {
    try {
      const courses = await this.prisma.course.findMany();
      return courses;
    } catch (error) {
      throw new Error('Can Not Fetch Course');
    }
  }

  async getCourseById(courseId: string) {
    try {
      const course = await this.prisma.course.findUnique({
        where: {
          courseId: courseId,
        },
      });
      return course;
    } catch (error) {
      throw new Error('Can Not Fetch Course');
    }
  }

  async getCourseByTitle(title: string) {
    try {
      const course = await this.prisma.course.findFirst({
        where: {
          title: title,
        },
      });
      return course;
    } catch (error) {
      throw new Error('Can Not Fetch Course');
    }
  }

  async getCourseBySchoolId(schoolId: string) {
    try {
      const courses = await this.prisma.course.findMany({
        where: {
          schoolId: schoolId,
        },
      });
      return courses;
    } catch (error) {
      throw new Error('Can Not Fetch Course');
    }
  }

  async getCourseByUsername(username: string, role: string) {
    try {
      let courses: any;
      if (role === Role.STUDENT) {
        courses =
          await this.courseStudentService.getCourseIdByUsername(username);
      } else if (role === Role.TEACHER) {
        courses =
          await this.courseTeacherService.getCourseIdByUsername(username);
      }

      const allCourse = await Promise.all(
        courses.map(async (item: Course) => {
          const course = await this.getCourseById(item.courseId);
          return course;
        }),
      );

      return allCourse;
    } catch (error) {
      throw new Error('Can Not Fetch Course');
    }
  }

  async getStudentInCourseByCourseId(courseId: string) {
    try {
      const students =
        await this.courseStudentService.getStudentByCourseId(courseId);
      return students;
    } catch (error) {
      throw new Error('Can Not Fetch Student In Course');
    }
  }

  async getTeacherInCourseByCourseId(courseId: string) {
    try {
      const teachers =
        await this.courseTeacherService.getTeacherByCourseId(courseId);
      return teachers;
    } catch (error) {
      throw new Error('Can Not Fetch Teacher In Course');
    }
  }

  async createCourse(
    createCourseDTO: CreateCourseDTO,
    username: string,
    schoolId: string,
    backgroundImage: Express.Multer.File,
  ) {
    try {
      const backgroundUrl = await this.minio.uploadImage(backgroundImage, '');
      const course = await this.prisma.course.create({
        data: {
          title: createCourseDTO.title,
          description: createCourseDTO.description,
          username: username,
          schoolId: schoolId,
          backgroundUrl: backgroundUrl.imageUrl,
        },
      });
      await this.prisma.courseTeacher.create({
        data: {
          courseId: course.courseId,
          username: username,
        },
      });
      return course;
    } catch (error) {
      throw new Error('Error Create Course');
    }
  }

  async countCourseByUsername(username: string) {
    try {
      const count = await this.prisma.course.count({
        where: {
          username: username,
        },
      });
      return count;
    } catch (error) {
      throw new Error('Can Not Get Course Count');
    }
  }

  async updateCourse(updateCourseDTO: UpdateCourseDTO, courseId: string) {
    try {
      const course = await this.prisma.course.update({
        where: {
          courseId: courseId,
        },
        data: {
          title: updateCourseDTO.title,
          description: updateCourseDTO.description,
        },
      });
      return course;
    } catch (error) {
      throw new Error('Can Not Update Course');
    }
  }

  async addStudentToCourse(addUserToCourseDTO: AddUserToCourseDTO) {
    try {
      const user = await this.courseStudentService.addStudentToCourse(
        addUserToCourseDTO.username,
        addUserToCourseDTO.courseId,
      );
      return user;
    } catch (error) {
      throw new Error('Error Add Student To Course');
    }
  }

  async addTeacherToCourse(addUserToCourseDTO: AddUserToCourseDTO) {
    try {
      const user = await this.courseTeacherService.addTeacherToCourse(
        addUserToCourseDTO.username,
        addUserToCourseDTO.courseId,
      );
      return user;
    } catch (error) {
      throw new Error('Error Add Student To Course');
    }
  }

  async deleteUserFromCourse(courseUserId: string, username: string) {
    try {
      const invalidCourseStudent =
        await this.courseStudentService.getCourseStudentById(courseUserId);
      const invalidCourseTeacher =
        await this.courseTeacherService.getCourseTeacherById(courseUserId);

      if (!invalidCourseTeacher && !invalidCourseStudent) {
        return 'User Not Found In Course';
      }

      if (invalidCourseStudent) {
        const deleteStudent =
          await this.courseStudentService.deleteStudentFromCourse(courseUserId);
        return deleteStudent;
      } else if (invalidCourseTeacher) {
        if (invalidCourseTeacher.username === username) {
          return 'Can Not Delete Your Self From Course';
        }
        const deleteTeacher =
          await this.courseTeacherService.deletTeacherFromCourse(courseUserId);
        return deleteTeacher;
      }
    } catch (error) {
      throw new Error('Error Delete User From Course');
    }
  }

  async deleteCourseById(courseId: string) {
    try {
      const course = await this.prisma.course.delete({
        where: {
          courseId: courseId,
        },
      });
      return course;
    } catch (error) {
      throw new Error('Error Delete Course');
    }
  }
}
