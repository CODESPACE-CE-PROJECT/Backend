import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDTO } from './dto/register.dto';
import { Role, Gender } from '@prisma/client';
import { UpdateUserDTO } from './dto/upadteUser.dto';
import { throws } from 'assert';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getAllUser() {
    try {
      const users = await this.prisma.users.findMany();
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
      });
      return user;
    } catch (error) {
      throw new Error('Error Fetch User');
    }
  }

  async getUserByEmail(email: string) {
    try {
      const user = await this.prisma.users.findFirst({
        where: {
          email: email,
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
      });
      return users;
    } catch (error) {
      throw new Error('Error Fetch User');
    }
  }

  async createUser(registerDTO: RegisterDTO, role: Role) {
    try {
      const user = await this.prisma.users.create({
        data: {
          schoolId: registerDTO.schoolId,
          username: registerDTO.username,
          email: registerDTO.email,
          hashedPassword: registerDTO.password,
          firstName: registerDTO.firstName,
          lastName: registerDTO.lastName,
          studentNo: registerDTO.studentNo,
          role: role,
          gender: registerDTO.gender === 'MALE' ? Gender.MALE : Gender.FEMAIL,
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
        where: {
          username: username,
        },
        data: {
          email: updateUserDTO.email,
          gender: updateUserDTO.gender === 'MALE' ? Gender.MALE : Gender.FEMAIL,
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
}
