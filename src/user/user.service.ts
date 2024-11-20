import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDTO } from './dto/register.dto';
import { Role, Gender, Users } from '@prisma/client';
import { UpdateUserDTO } from './dto/upadteUser.dto';
import * as bcrypt from 'bcrypt';
import { MinioClientService } from 'src/minio-client/minio-client.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly minioClient: MinioClientService,
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
          school: true,
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

  async getUserBySchoolId(schoolId: string) {
    try {
      const users = await this.prisma.users.findMany({
        where: {
          schoolId: schoolId,
        },
        omit: {
          hashedPassword: true,
        },
      });
      return users;
    } catch (error) {
      throw new Error('Error Fetch User');
    }
  }

  async createUser(registerDTO: RegisterDTO, role: Role) {
    try {
      // hashing password
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash(registerDTO.password, salt);

      const user = await this.prisma.users.create({
        omit: {
          hashedPassword: true,
        },
        data: {
          schoolId: registerDTO.schoolId,
          username: registerDTO.username,
          email: registerDTO.email,
          hashedPassword: password,
          firstName: registerDTO.firstName,
          lastName: registerDTO.lastName,
          studentNo: registerDTO.studentNo,
          role: role,
          gender: registerDTO.gender === 'Male' ? Gender.MALE : Gender.FEMALE,
        },
      });
      return user;
    } catch (err) {
      throw new Error('Error Create User');
    }
  }

  async updateUserByUsername(username: string, updateUserDTO: UpdateUserDTO) {
    try {
      const user = await this.prisma.users.update({
        omit: {
          hashedPassword: true,
        },
        where: {
          username: username,
        },
        data: {
          email: updateUserDTO.email,
          gender: updateUserDTO.gender === 'Male' ? Gender.MALE : Gender.FEMALE,
          firstName: updateUserDTO.firstName,
          lastName: updateUserDTO.lastName,
          studentNo: updateUserDTO.studentNo,
        },
      });
      return user;
    } catch (error) {
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

  async setIpAddressByUsername(_user: Users, ipAdd: string) {
    try {
      const user = await this.prisma.users.update({
        where: {
          username: _user.username,
        },
        data: {
          IpAddress: ipAdd,
        },
      });
      return user;
    } catch (error) {
      throw new Error('Error Set Ip Address');
    }
  }

  async uploadAvatarProfile(
    file: Express.Multer.File,
    username: string,
    pictureUrl: string | null,
  ) {
    try {
      const uploadedImage = await this.minioClient.uploadImage(
        file,
        pictureUrl,
      );
      await this.prisma.users.update({
        where: {
          username: username,
        },
        data: {
          pictureUrl: uploadedImage.imageUrl,
        },
      });
      return uploadedImage.imageUrl;
    } catch (error) {
      throw new Error(error);
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
