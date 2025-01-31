import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { MinioClientService } from 'src/minio-client/minio-client.service';
import { CreateUserDTO } from './dto/createUserDTO.dto';
import { UpdateProfileDTO } from './dto/upadteProfile.dto';
import { UpdateUserDTO } from './dto/updateUserDTO.dto';
import { UpdateRealTimeDTO } from './dto/updateRealTimeDTO.dto';
import { ResetPasswordDTO } from './dto/resetPasswordDTO.dto';
import { MailerService } from 'src/mailer/mailer.service';
import { UtilsService } from 'src/utils/utils.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly minio: MinioClientService,
    private readonly mailerService: MailerService,
    private readonly utilService: UtilsService,
  ) {}

  async getAllUser() {
    try {
      const users = await this.prisma.users.findMany({
        omit: {
          hashedPassword: true,
        },
      });
      return users;
    } catch (error) {
      throw new Error('Error Fetch User');
    }
  }

  async getUserByUsername(username: string) {
    try {
      const user = await this.prisma.users.findUnique({
        where: {
          username: username,
        },
        include: {
          school: {
            select: {
              schoolName: true,
              package: true,
            },
          },
        },
      });
      return user;
    } catch (error) {
      throw new Error('Error Fetch User');
    }
  }

  async getUserByEmail(email: string | undefined) {
    try {
      const user = await this.prisma.users.findFirst({
        omit: {
          hashedPassword: true,
        },
        where: {
          email: email,
        },
        include: {
          school: true,
        },
      });
      return user;
    } catch (error) {
      throw new Error('Error Fetch User');
    }
  }

  async createUser(createUserDTO: CreateUserDTO) {
    try {
      const collectUserInfo: {
        username: string;
        password: string;
        email: string;
        firstName: string;
        lastName: string;
      }[] = [];

      // hashing password
      const allUser = await Promise.all(
        createUserDTO.users.map(async (user) => {
          const password = await this.utilService.generatePassword();

          collectUserInfo.push({
            username: user.username,
            password: password,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          });

          return {
            schoolId: createUserDTO.schoolId,
            username: user.username,
            email: user.email,
            hashedPassword: await bcrypt.hash(password, await bcrypt.genSalt()),
            firstName: user.firstName,
            lastName: user.lastName,
            studentNo: user.studentNo,
            role: user.role,
            gender: user.gender,
          };
        }),
      );

      const user = await this.prisma.users.createManyAndReturn({
        omit: {
          hashedPassword: true,
        },
        data: allUser,
      });

      await Promise.all(
        collectUserInfo.map(async (user) => {
          await this.mailerService.sendWelcomeEmail(
            user.email,
            `${user.firstName} ${user.lastName}`,
            user.username,
            user.password,
          );
        }),
      );

      return user;
    } catch (err) {
      console.log(err);
      throw new Error('Error Create User');
    }
  }

  async updateProfile(username: string, updateProfileDTO: UpdateProfileDTO) {
    try {
      let imageUrl = null;
      if (updateProfileDTO.picture) {
        imageUrl = await this.minio.uploadFile(
          'profile',
          updateProfileDTO.picture,
          '',
        );
      }

      const user = await this.prisma.users.update({
        omit: {
          hashedPassword: true,
        },
        where: {
          username: username,
        },
        data: {
          email: updateProfileDTO.email,
          gender: updateProfileDTO.gender,
          firstName: updateProfileDTO.firstName,
          lastName: updateProfileDTO.lastName,
          studentNo: updateProfileDTO.studentNo,
          pictureUrl: imageUrl?.fileUrl,
        },
      });
      return user;
    } catch (error) {
      throw new Error('Error Update Profile');
    }
  }

  async resetPasswordProfile(
    username: string,
    resetPasswordDTO: ResetPasswordDTO,
  ) {
    try {
      const user = await this.prisma.users.update({
        where: {
          username: username,
        },
        data: {
          hashedPassword: await bcrypt.hash(
            resetPasswordDTO.password,
            await bcrypt.genSalt(),
          ),
        },
      });
      return user;
    } catch (error) {
      throw new Error('Error Update Password Profile');
    }
  }

  async updateUserByUsername(username: string, updateUserDTO: UpdateUserDTO) {
    try {
      let imageUrl = null;
      if (updateUserDTO.picture) {
        imageUrl = await this.minio.uploadFile(
          'profile',
          updateUserDTO.picture,
          '',
        );
      }

      const user = await this.prisma.users.update({
        omit: {
          hashedPassword: true,
        },
        where: {
          username: username,
        },
        data: {
          email: updateUserDTO.email,
          gender: updateUserDTO.gender,
          firstName: updateUserDTO.firstName,
          lastName: updateUserDTO.lastName,
          studentNo: updateUserDTO.studentNo,
          pictureUrl: imageUrl?.fileUrl,
          isEnable: updateUserDTO.isEnable,
          allowLogin: updateUserDTO.allowLogin,
        },
      });
      return user;
    } catch (error) {
      console.log(error);
      throw new Error('Error Update User');
    }
  }

  async updateStatusByUsername(username: string, active: boolean) {
    try {
      const user = await this.prisma.users.update({
        where: {
          username: username,
        },
        data: {
          isActived: active,
        },
      });
      return user;
    } catch (error) {
      throw new Error('Error Update Status User');
    }
  }

  async deleteUserByUsername(username: string) {
    try {
      const user = await this.prisma.users.delete({
        where: {
          username: username,
        },
      });
      return user;
    } catch (error) {
      throw new Error('Error Dlete User');
    }
  }

  async setRealTimeByUsername(
    username: string,
    updateUserDTO: UpdateRealTimeDTO,
  ) {
    try {
      const user = await this.prisma.users.update({
        where: {
          username: username,
        },
        data: {
          IpAddress: updateUserDTO.ipAddress,
          isActived: updateUserDTO.isActive,
        },
      });
      return user;
    } catch (error) {
      throw new Error('Error Set ');
    }
  }

  async countTeacherAccount(schoolId: string): Promise<number> {
    try {
      const count = await this.prisma.users.count({
        where: {
          schoolId: schoolId,
          role: Role.TEACHER,
        },
      });
      return count;
    } catch (error) {
      throw new Error('Error Count Teacher Account');
    }
  }

  async countStudentAccount(schoolId: string): Promise<number> {
    try {
      const count = await this.prisma.users.count({
        where: {
          schoolId: schoolId,
          role: Role.STUDENT,
        },
      });
      return count;
    } catch (error) {
      throw new Error('Error Count Student Account');
    }
  }
}
