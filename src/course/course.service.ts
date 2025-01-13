import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCourseDTO } from './dto/createCourse.dto';
import { UpdateCourseDTO } from './dto/updateCourse.dto';
import { AnnounceAssignmentType, NotificationType, Role } from '@prisma/client';
import { AddUserToCourseDTO } from './dto/addUserToCourse.dto';
import { MinioClientService } from 'src/minio-client/minio-client.service';
import { UserService } from 'src/user/user.service';
import { IRequest } from 'src/auth/interface/request.interface';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class CourseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioClientService,
    private readonly userService: UserService,
    private notificationServie: NotificationService,
  ) {}

  async getAllCourse() {
    try {
      const courses = await this.prisma.course.findMany({
        include: {
          user: true,
        },
      });
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
        include: {
          courseTeacher: true,
          courseStudent: {
            include: {
              user: true,
            },
          },
        },
      });
      return course;
    } catch (error) {
      throw new Error('Can Not Fetch Course');
    }
  }

  async getCourseByIdAndUsername(courseId: string, username: string) {
    try {
      const course = await this.prisma.course.findUnique({
        where: {
          courseId: courseId,
        },
        include: {
          courseAnnounce: {
            include: {
              replyAnnounce: {
                orderBy: {
                  createAt: 'desc',
                },
              },
            },
          },
          assignment: {
            orderBy: {
              announceDate: 'desc',
            },
            where: {
              announceType: AnnounceAssignmentType.ANNOUNCED,
            },
          },
          courseTeacher: {
            where: {
              username: username,
            },
          },
          courseStudent: {
            where: {
              username: username,
            },
          },
        },
      });
      return course;
    } catch (error) {
      throw new Error('Can Not Fetch Course');
    }
  }

  async getPeopleById(courseId: string) {
    try {
      const course = await this.prisma.course.findUnique({
        where: {
          courseId: courseId,
        },
        include: {
          courseStudent: true,
          courseTeacher: true,
        },
      });
      return course;
    } catch (error) {
      throw new Error('Can Not Fetch People In Course');
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

  async getCourseByUsername(username: string) {
    try {
      const course = await this.prisma.course.findMany({
        where: {
          OR: [
            {
              courseStudent: {
                some: {
                  username: username,
                },
              },
            },
            {
              courseTeacher: {
                some: {
                  username: username,
                },
              },
            },
          ],
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });
      return course;
    } catch (error) {
      throw new Error('Can Not Fetch Course');
    }
  }

  async getPeopleInCourseByCourseId(courseId: string) {
    try {
      const course = await this.prisma.course.findFirst({
        where: {
          courseId: courseId,
        },
        select: {
          courseStudent: {
            select: {
              courseStudentId: true,
              user: {
                omit: {
                  hashedPassword: true,
                },
              },
            },
          },
          courseTeacher: {
            select: {
              courseTeachertId: true,
              user: {
                omit: {
                  hashedPassword: true,
                },
              },
            },
          },
          schoolId: true,
        },
      });
      return course;
    } catch (error) {}
  }

  async createCourse(
    createCourseDTO: CreateCourseDTO,
    username: string,
    schoolId: string,
  ) {
    try {
      let imageUrl = null;
      if (createCourseDTO.picture) {
        imageUrl = await this.minio.uploadImage(
          'course',
          createCourseDTO.picture,
          '',
        );
      }

      const course = await this.prisma.course.create({
        data: {
          title: createCourseDTO.title,
          description: createCourseDTO.description,
          username: username,
          schoolId: schoolId,
          backgroundUrl: imageUrl?.imageUrl,
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

  async updateCourseById(
    updateCourseDTO: UpdateCourseDTO,
    courseId: string,
    username: string,
    oldTitle: string,
  ) {
    try {
      let imageUrl = null;
      if (updateCourseDTO.picture) {
        imageUrl = await this.minio.uploadImage(
          'course',
          updateCourseDTO.picture,
          '',
        );
      }
      const course = await this.prisma.course.update({
        where: {
          courseId: courseId,
        },
        data: {
          title: updateCourseDTO.title,
          description: updateCourseDTO.description,
        },
      });

      await this.notificationServie.createNotification(
        username,
        course.courseId,
        NotificationType.ACTION,
        course.title + ' update course',
      );

      await this.notificationServie.updateNotification(
        course.courseId,
        oldTitle,
        course.title,
      );

      return course;
    } catch (error) {
      throw new Error('Can Not Update Course');
    }
  }

  async addPeopleToCourse(addUserToCourseDTO: AddUserToCourseDTO) {
    try {
      await Promise.all(
        addUserToCourseDTO.users.map(async (username) => {
          const data = await this.userService.getUserByUsername(username);
          if (data?.role === Role.TEACHER) {
            await this.prisma.courseTeacher.create({
              data: {
                username: username,
                courseId: addUserToCourseDTO.courseId,
              },
            });
          } else if (data?.role === Role.STUDENT) {
            await this.prisma.courseStudent.create({
              data: {
                username: username,
                courseId: addUserToCourseDTO.courseId,
              },
            });
          }
        }),
      );
      return true;
    } catch (error) {}
  }

  async deleteUserFromCourse(
    courseId: string,
    username: string,
    user: IRequest,
  ) {
    try {
      const validUser = await this.prisma.course.findFirst({
        include: {
          courseTeacher: true,
          courseStudent: true,
        },
        where: {
          courseId: courseId,
        },
      });

      const student = validUser?.courseStudent.find(
        (user) => user.username === username,
      );
      const teacher = validUser?.courseTeacher.find(
        (user) => user.username === username,
      );

      if (!student && !teacher) {
        return 'User Not Found In Course';
      }
      if (student) {
        const deleteStudent = await this.prisma.courseStudent.delete({
          where: {
            courseStudentId: student.courseStudentId,
          },
        });
        return deleteStudent;
      } else if (teacher) {
        if (teacher.username === user.user.username) {
          return 'Can Not Delete Your Self From Course';
        }
        const deleteTeacher = await this.prisma.courseTeacher.delete({
          where: {
            courseTeachertId: teacher.courseTeachertId,
          },
        });
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
