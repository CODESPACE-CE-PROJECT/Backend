import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags } from '@nestjs/swagger';
import { RegisterDTO } from './dto/register.dto';
import { Role } from '@prisma/client';
import { SchoolService } from 'src/school/school.service';
import { UpdateUserDTO } from './dto/upadteUser.dto';
import { AuthGuard } from '@nestjs/passport';
import { IRequest } from 'src/auth/interface/request.interface';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private schoolService: SchoolService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAllUser(@Request() req: IRequest) {
    if (req.user.role !== 'ADMIN') {
      throw new HttpException(
        'Do Not Have Permission(Admin)',
        HttpStatus.FORBIDDEN,
      );
    }
    const users = await this.userService.getAllUser();
    return {
      message: 'Successfully Get User',
      data: users,
    };
  }

  @Get('username/:username')
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

  @Get('email/:email')
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

  @Get('school/:schoolId')
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
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req: IRequest) {
    const users = await this.userService.getUserByUsername(req.user.username);
    return {
      message: 'Successfully Get Profile',
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

  @Post('create-teacher')
  async createTeacherAccount(@Body() registerDTO: RegisterDTO) {
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
    const user = await this.userService.createUser(registerDTO, Role.TEACHER);
    return {
      message: 'Successfully Create Teacher Account',
      data: user,
    };
  }

  @Post('create-student')
  async createStudentAccount(@Body() registerDTO: RegisterDTO) {
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
    const user = await this.userService.createUser(registerDTO, Role.STUDENT);
    return {
      message: 'Successfully Create Student Account',
      data: user,
    };
  }

  @Get('update-ip/:username')
  async setIpAddressByusername(@Param('username') username:string, @Request() req:any) {
    const user = await this.userService.setIpAddressByUsername(username, req.socket.remoteAddress)
    if(!user){
      throw new HttpException('Can Not Update IP Address', HttpStatus.NOT_ACCEPTABLE)
    }
    return {message: 'Successfully Update Ip Address', data: user}
  } 

  @Patch('edit/:username')
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
