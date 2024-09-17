import {
  HttpCode,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { SchoolService } from 'src/school/school.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class InitService {
  constructor(
    private readonly userService: UserService,
    private readonly schoolService: SchoolService,
  ) {}

  async InitialAdmin() {
    try {
      const invalidSchool = await this.schoolService.getSchoolByName('Admin');
      if (invalidSchool) {
        throw new HttpException(
          'Already Inital Admin Account',
          HttpStatus.BAD_REQUEST,
        );
      }
      const school = await this.schoolService.createSchool({
        schoolName: 'Admin',
      });

      const adminDTO = {
        schoolId: school.schoolId,
        username: 'admin',
        email: '',
        password: 'admin',
        studentNo: '',
        firstName: 'Admin',
        lastName: 'Admin',
        gender: 'Female',
      };
      const user = await this.userService.createUser(adminDTO, Role.ADMIN);
      return user;
    } catch (error) {
      throw new Error('Can Create Inital Admin');
    }
  }
}
