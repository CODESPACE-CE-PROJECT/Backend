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
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegisterDTO } from './dto/register.dto';
import { Role, Users } from '@prisma/client';
import { SchoolService } from 'src/school/school.service';
import { UpdateUserDTO } from './dto/upadteUser.dto';
import { AuthGuard } from '@nestjs/passport';
import { IRequest } from 'src/auth/interface/request.interface';
import { Request as RequestExpress, Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadDTO } from './dto/fileUpload.dto';
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private schoolService: SchoolService,
  ) {}

  @ApiOperation({ summary: 'Get All User (Admin)' })
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAllUser(@Request() req: IRequest) {
    if (req.user.role !== Role.ADMIN) {
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

  @ApiOperation({ summary: 'Get User By Username (Teacher,Admin)' })
  @UseGuards(AuthGuard('jwt'))
  @Get('username/:username')
  async getUserByUsername(
    @Request() req: IRequest,
    @Param('username') username: string,
  ) {
    if (req.user.role !== Role.ADMIN && req.user.role !== Role.TEACHER) {
      throw new HttpException(
        'Do Not Have Permission(Teacher,Admin)',
        HttpStatus.FORBIDDEN,
      );
    }
    const user = await this.userService.getUserByUsername(username);
    if (!user) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }
    return {
      message: 'Successfully get User',
      data: user,
    };
  }

  @ApiOperation({ summary: 'Get User By Email (Teacher,Admin)' })
  @UseGuards(AuthGuard('jwt'))
  @Get('email/:email')
  async getUserByEmail(
    @Request() req: IRequest,
    @Param('email') email: string,
  ) {
    if (req.user.role !== Role.ADMIN && req.user.role !== Role.TEACHER) {
      throw new HttpException(
        'Do Not Have Permission(Teacher,Admin)',
        HttpStatus.FORBIDDEN,
      );
    }

    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }
    return {
      message: 'Successfully get User',
      data: user,
    };
  }

  @ApiOperation({ summary: 'Get User By School Id (Student,Teacher,Admin)' })
  @UseGuards(AuthGuard('jwt'))
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

  @ApiOperation({ summary: 'Get Profile (Student, Teacher, Admin)' })
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req: IRequest) {
    const { user, profileUrl } = await this.userService.getUserByUsername(
      req.user.username,
    );
    if (user) {
      user.picture = profileUrl;
    }
    return {
      message: 'Successfully Get Profile',
      data: user,
    };
  }

  @ApiOperation({ summary: 'Edit Profile (Student,Teacher,Admin)' })
  @UseGuards(AuthGuard('jwt'))
  @Patch('profile/edit')
  async updateProfile(
    @Request() req: IRequest,
    @Body() updateUserDTO: UpdateUserDTO,
  ) {
    const user = await this.userService.updateUserByUsername(
      req.user.username,
      updateUserDTO,
    );
    return {
      message: 'Successfully Update User',
      data: user,
    };
  }

  @ApiOperation({ summary: 'Upload Avatar Profile (Student, Teacher, Admin)' })
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'Upload Avatar Profile', type: FileUploadDTO })
  @Post('profile/avatar')
  async uploadAvatarProfile(
    @Request() req: IRequest,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // Validate file size (10MB max)
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: 'image/jpeg|image/png' }),
        ],
        exceptionFactory: () => new BadRequestException('Invalid file Upload'),
      }),
    )
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new HttpException('No File Upload', HttpStatus.NO_CONTENT);
    }
    const uploadedImage = await this.userService.uploadAvatarProfile(
      file,
      req.user.username,
    );
    return {
      message: 'Upload Avatar Profile Successfully',
      imageUrl: uploadedImage,
    };
  }

  @ApiOperation({ summary: 'Create Admin Account (Admin)' })
  @UseGuards(AuthGuard('jwt'))
  @Post('create-admin')
  async createAdminAccount(
    @Request() req: IRequest,
    @Body() registerDTO: RegisterDTO,
  ) {
    if (req.user.role !== Role.ADMIN) {
      throw new HttpException(
        'Do Not Have Permission(Admin)',
        HttpStatus.FORBIDDEN,
      );
    }
    const invalidUsername = await this.userService.getUserByUsername(
      registerDTO.username,
    );
    const invalidEmail = await this.userService.getUserByEmail(
      registerDTO.email,
    );
    if (
      invalidUsername?.username ||
      invalidEmail?.email === registerDTO.email
    ) {
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

  @ApiOperation({ summary: 'Create Teacher Account (Teacher,Admin)' })
  @UseGuards(AuthGuard('jwt'))
  @Post('create-teacher')
  async createTeacherAccount(
    @Request() req: IRequest,
    @Body() registerDTO: RegisterDTO,
  ) {
    if (req.user.role !== Role.ADMIN && req.user.role !== Role.TEACHER) {
      throw new HttpException(
        'Do Not Have Permission(Teacher,Admin)',
        HttpStatus.FORBIDDEN,
      );
    }
    if (req.user.role === Role.TEACHER) {
      registerDTO.schoolId = req.user.schoolId;
    }
    const school = await this.schoolService.getSchoolById(registerDTO.schoolId);
    const countTeacher = await this.userService.countTeacherAccount(
      registerDTO.schoolId,
    );
    const limitTeacher = school?.permission?.maxCreateTeacher as number;

    if (!school?.permission?.canCreateUser && req.user.role === Role.TEACHER) {
      throw new HttpException(
        'Can Not Have Permission Create User',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    if (countTeacher >= limitTeacher) {
      throw new HttpException(
        `Over limit Create Teacher ${school?.permission?.maxCreateTeacher}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const invalidUsername = await this.userService.getUserByUsername(
      registerDTO.username,
    );

    if (
      invalidUsername?.username ||
      invalidUsername?.email === registerDTO.email
    ) {
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
  @ApiOperation({ summary: 'Create Student Account (Teacher,Admin)' })
  @UseGuards(AuthGuard('jwt'))
  @Post('create-student')
  async createStudentAccount(
    @Request() req: IRequest,
    @Body() registerDTO: RegisterDTO,
  ) {
    if (req.user.role !== Role.ADMIN && req.user.role !== Role.TEACHER) {
      throw new HttpException(
        'Do Not Have Permission(Teacher,Admin)',
        HttpStatus.FORBIDDEN,
      );
    }
    if (req.user.role === Role.TEACHER) {
      registerDTO.schoolId = req.user.schoolId;
    }
    const school = await this.schoolService.getSchoolById(registerDTO.schoolId);
    const countStudent = await this.userService.countStudentAccount(
      registerDTO.schoolId,
    );
    const limitStudent = school?.permission?.maxCreateStudent as number;

    if (!school?.permission?.canCreateUser && req.user.role === Role.TEACHER) {
      throw new HttpException(
        'Can Not Have Permission Create User',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    if (countStudent >= limitStudent) {
      throw new HttpException(
        `Over limit Create Student ${school?.permission?.maxCreateStudent}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const invalidUsername = await this.userService.getUserByUsername(
      registerDTO.username,
    );

    if (
      invalidUsername?.username ||
      invalidUsername?.email === registerDTO.email
    ) {
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

  @ApiOperation({ summary: 'Update IP Address (Student,Teacher,Admin)' })
  @UseGuards(AuthGuard('jwt'))
  @Get('update-ip')
  async setIpAddressByusername(@Request() req: RequestExpress) {
    const user = await this.userService.setIpAddressByUsername(
      req.user as Users,
      req.socket.remoteAddress as string,
    );
    if (!user) {
      throw new HttpException(
        'Can Not Update IP Address',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    return { message: 'Successfully Update Ip Address', data: user };
  }

  @ApiOperation({ summary: 'Edit User By Username(Teacher,Admin)' })
  @UseGuards(AuthGuard('jwt'))
  @Patch('edit/:username')
  async updateUserById(
    @Request() req: IRequest,
    @Param('username') username: string,
    @Body() updateUserDTO: UpdateUserDTO,
  ) {
    if (req.user.role !== Role.ADMIN && req.user.role !== Role.TEACHER) {
      throw new HttpException(
        'Do Not Have Permission(Teacher,Admin)',
        HttpStatus.FORBIDDEN,
      );
    }
    if (req.user.role !== Role.ADMIN && req.user.role !== Role.TEACHER) {
      const permission = await this.schoolService.getSchoolById(
        req.user.schoolId,
      );
      if (!permission?.permission?.canUpdateUser) {
        throw new HttpException(
          'Can Not Have Permission Update User',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }
    }
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

  @ApiOperation({ summary: 'Delete User By Username(Teacher,Admin)' })
  @UseGuards(AuthGuard('jwt'))
  @Delete(':username')
  async deleteUserByUsername(
    @Request() req: IRequest,
    @Param('username') username: string,
  ) {
    if (req.user.role !== Role.ADMIN && req.user.role !== Role.TEACHER) {
      throw new HttpException(
        'Do Not Have Permission(Teacher,Admin)',
        HttpStatus.FORBIDDEN,
      );
    }
    if (req.user.role !== Role.ADMIN && req.user.role === Role.TEACHER) {
      const permission = await this.schoolService.getSchoolById(
        req.user.schoolId,
      );
      if (!permission?.permission?.canDeleteUser) {
        throw new HttpException(
          'Can Not Have Permission Delete User',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }
    }
    if (req.user.username === username) {
      throw new HttpException(
        'Can Not Delete Your Self',
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.userService.getUserByUsername(username);
    if (!user) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }
    if (
      req.user.role === Role.ADMIN ||
      (req.user.role === Role.TEACHER &&
        user?.schoolId === req.user.schoolId &&
        user?.role !== Role.ADMIN)
    ) {
      await this.userService.deleteUserByUsername(username);
      return { message: 'Delete User Successfully' };
    } else {
      throw new HttpException('Error Delete User', HttpStatus.BAD_REQUEST);
    }
  }
}
