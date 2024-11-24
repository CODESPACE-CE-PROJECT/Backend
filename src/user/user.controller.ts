import {
  Body,
  Controller,
  Get,
  HttpException,
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
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Role, Users } from '@prisma/client';
import { SchoolService } from 'src/school/school.service';
import { UpdateProfileDTO } from './dto/upadteProfile.dto';
import { IRequest } from 'src/auth/interface/request.interface';
import { Request as RequestExpress, Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UtilsService } from 'src/utils/utils.service';
import { CreateUserDTO } from './dto/createUserDTO.dto';
import { UpdateUserDTO } from './dto/updateUserDTO.dto';

@ApiBearerAuth()
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private schoolService: SchoolService,
    private utilsService: UtilsService,
  ) {}

  @ApiOperation({ summary: 'Get All User (Admin)' })
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUser(@Request() req: IRequest) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.ADMIN,
    ]);
    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }
    const users = await this.userService.getAllUser();
    return {
      message: 'Successfully Get User',
      data: users,
    };
  }

  @ApiOperation({ summary: 'Get User By Username (Teacher,Admin)' })
  @UseGuards(JwtAuthGuard)
  @Get('username/:username')
  async getUserByUsername(
    @Request() req: IRequest,
    @Param('username') username: string,
  ) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.ADMIN,
      Role.TEACHER,
    ]);
    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
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
  @UseGuards(JwtAuthGuard)
  @Get('email/:email')
  async getUserByEmail(
    @Request() req: IRequest,
    @Param('email') email: string,
  ) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.ADMIN,
      Role.TEACHER,
    ]);
    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
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

  @ApiOperation({ summary: 'Get Profile (Student, Teacher, Admin)' })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: IRequest) {
    const user = await this.userService.getUserByUsername(req.user.username);

    if (user) {
      Reflect.deleteProperty(user, 'hashedPassword');
    }

    return {
      message: 'Successfully Get Profile',
      data: user,
    };
  }

  @ApiOperation({ summary: 'Edit Profile (Student,Teacher,Admin)' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('picture'))
  @ApiConsumes('multipart/form-data', 'application/json')
  @Patch('profile')
  async updateProfile(
    @Request() req: IRequest,
    @Body() updateProfileDTO: UpdateProfileDTO,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: 'image/jpeg|image/png' }),
        ],
        exceptionFactory: () => new BadRequestException('Invalid file Upload'),
      }),
    )
    picture: Express.Multer.File,
  ) {
    updateProfileDTO.picture = picture;
    const user = await this.userService.updateProfile(
      req.user.username,
      updateProfileDTO,
    );
    return {
      message: 'Successfully Update Profile',
      data: user,
    };
  }

  @ApiOperation({ summary: 'Create User Account (Admin, Teacher)' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async createAccount(
    @Request() req: IRequest,
    @Body() createUserDTO: CreateUserDTO,
  ) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.ADMIN,
      Role.TEACHER,
    ]);
    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }

    if (
      req.user.role === Role.TEACHER &&
      createUserDTO.users.find((user) => user.role === Role.ADMIN) !== undefined
    ) {
      throw new HttpException(
        'In List Has Admin Account',
        HttpStatus.BAD_REQUEST,
      );
    }
    const school = await this.schoolService.getSchoolById(
      createUserDTO.schoolId,
    );

    if (!school?.permission?.canCreateUser && req.user.role === Role.TEACHER) {
      throw new HttpException(
        'can not have permission create user',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const countTeacher = await this.userService.countTeacherAccount(
      createUserDTO.schoolId,
    );
    const countStudent = await this.userService.countStudentAccount(
      createUserDTO.schoolId,
    );

    if (countTeacher >= (school?.permission?.maxCreateTeacher as number)) {
      throw new HttpException(
        `Over Limit Create Teacher ${school?.permission?.maxCreateTeacher}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (countStudent >= (school?.permission?.maxCreateStudent as number)) {
      throw new HttpException(
        `Over Limit Create Student ${school?.permission?.maxCreateStudent}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const validate = await Promise.all(
      createUserDTO.users.map(async (user) => {
        const validateUsername = await this.userService.getUserByUsername(
          user.username,
        );
        const validateEmail = await this.userService.getUserByEmail(user.email);
        return {
          username: user.username,
          validateUsername: validateUsername !== null,
          validateEmail: validateEmail !== null,
        };
      }),
    );

    if (
      validate.find(
        (validate) =>
          validate.validateUsername === true || validate.validateEmail === true,
      )
    ) {
      throw new HttpException(
        'Already have Username or Email',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const user = await this.userService.createUser(createUserDTO);
    return {
      message: 'Successfully Create  Account',
      data: user,
    };
  }

  @ApiOperation({ summary: 'Update IP Address (Student,Teacher,Admin)' })
  @UseGuards(JwtAuthGuard)
  @Get('update-ip')
  async setIpAddressByusername(@Request() req: RequestExpress) {
    const ip =
      req.headers['cf-connecting-ip']?.toString() ||
      req.headers['x-real-ip']?.toString() ||
      req.headers['x-forwarded-for']?.toString() ||
      req.socket.remoteAddress?.toString() ||
      '';
    const user = await this.userService.setIpAddressByUsername(
      req.user as Users,
      ip,
    );
    if (!user) {
      throw new HttpException(
        'Can Not Update IP Address',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    return { message: 'Successfully Update Ip Address', data: user };
  }

  @ApiOperation({ summary: 'Edit User By Username (Teacher,Admin)' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('picture'))
  @ApiConsumes('multipart/form-data', 'application/json')
  @Patch('username/:username')
  async updateUserById(
    @Request() req: IRequest,
    @Param('username') username: string,
    @Body() updateUserDTO: UpdateUserDTO,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: 'image/jpeg|image/png' }),
        ],
        exceptionFactory: () => new BadRequestException('Invalid file Upload'),
      }),
    )
    picture: Express.Multer.File,
  ) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.ADMIN,
      Role.TEACHER,
    ]);
    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }

    const validUser = await this.userService.getUserByUsername(username);
    if (!validUser) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }

    if (
      validUser.schoolId !== req.user.schoolId &&
      req.user.role === Role.TEACHER
    ) {
      throw new HttpException(
        'This User In Not In Your School',
        HttpStatus.BAD_REQUEST,
      );
    }

    const permission = await this.schoolService.getSchoolById(
      req.user.role === Role.ADMIN ? validUser.schoolId : req.user.schoolId,
    );

    if (
      !permission?.permission?.canUpdateUser &&
      req.user.role === Role.TEACHER
    ) {
      throw new HttpException(
        'Can Not Have Permission Update User',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    updateUserDTO.picture = picture;

    const user = await this.userService.updateUserByUsername(
      username,
      updateUserDTO,
    );
    return {
      message: 'Successfully Update User',
      data: user,
    };
  }

  @ApiOperation({ summary: 'Delete User By Username (Teacher,Admin)' })
  @UseGuards(JwtAuthGuard)
  @Delete(':username')
  async deleteUserByUsername(
    @Request() req: IRequest,
    @Param('username') username: string,
  ) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.ADMIN,
      Role.TEACHER,
    ]);

    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }

    const user = await this.userService.getUserByUsername(username);
    if (!user) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }

    const permission = await this.schoolService.getSchoolById(
      req.user.role === Role.ADMIN ? user.schoolId : req.user.schoolId,
    );

    if (
      !permission?.permission?.canDeleteUser &&
      req.user.role === Role.TEACHER
    ) {
      throw new HttpException(
        'Can Not Have Permission Delete User',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    if (req.user.username === username) {
      throw new HttpException(
        'Can Not Delete Your Self',
        HttpStatus.BAD_REQUEST,
      );
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
