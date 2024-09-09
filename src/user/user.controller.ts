import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags } from '@nestjs/swagger';
import { RegisterDTO } from './dto/register.dto';
import { Role } from '@prisma/client';
import { SchoolService } from 'src/school/school.service';
import { UpdateUserDTO } from './dto/upadteUser.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private schoolService: SchoolService,
  ) {}

  @Get()
  async getAllUser() {
    const users = await this.userService.getAllUser();
    return {
      message: 'Successfully Get User',
      data: users,
    };
  }

  @Get(':username')
  async getUserByUsername(@Param('username') username: string) {
    const user = await this.userService.getUserByUsername(username);
    if (!user) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }
    return {
      message: 'Successfully get User',
      data: user,
    };
  }

  @Get('/emial/:email')
  async getUserByEmail(@Param('email') email: string) {
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }
    return {
      message: 'Successfully get User',
      data: user,
    };
  }

  @Get('/school/:schoolId')
  async getUserBySchoolId(@Param('schoolId') schoolId: string) {
    const school = await this.schoolService.getSchoolById(schoolId);
    if (!school) {
      throw new HttpException('School Not Found', HttpStatus.NOT_FOUND);
    }
    const users = await this.userService.getUserBySchoolId(schoolId);
    return {
      message: 'Successfully get User',
      data: users,
    };
  }

  @Post('create-admin')
  async createAdminAccount(@Body() registerDTO: RegisterDTO) {
    const invalidUsername = await this.userService.getUserByUsername(
      registerDTO.username,
    );
    const invalidEmail = await this.userService.getUserByEmail(
      registerDTO.email,
    );
    if (invalidUsername || invalidEmail) {
      throw new HttpException(
        'Already have Username or Email',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    const user = await this.userService.createUser(registerDTO, Role.ADMIN);
    return {
      message: 'Successfully Create Admin Account',
      data: user,
    };
  }

  @Patch(':username')
  async updateUserById(
    @Param('username') username: string,
    @Body() updateUserDTO: UpdateUserDTO,
  ) {
    const invalidUser = await this.userService.getUserByUsername(username);
    if (!invalidUser) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }
    const user = await this.userService.updateUserByUsername(
      username,
      updateUserDTO,
    );
    return {
      message: 'Successfully Update User',
      data: user,
    };
  }
}
