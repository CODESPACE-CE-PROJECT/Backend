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
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import * as XLSX from 'xlsx';
import { SchoolService } from 'src/school/school.service';
import { UpdateProfileDTO } from './dto/upadteProfile.dto';
import { IRequest } from 'src/auth/interface/request.interface';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UtilsService } from 'src/utils/utils.service';
import { CreateUserDTO } from './dto/createUserDTO.dto';
import { UpdateUserDTO } from './dto/updateUserDTO.dto';
import { UpdateRealTimeDTO } from './dto/updateRealTimeDTO.dto';
import { importFileExelDTO } from './dto/importFileExelDTO.dto';
import { IFileFormat, ValidateType } from './interface/fileFormat.interface';
import { ResetPasswordDTO } from './dto/resetPasswordDTO.dto';

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
    @UploadedFile() picture?: Express.Multer.File,
  ) {
    if (picture) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['image/jpeg', 'image/png'];

      if (picture.size > maxSize) {
        throw new BadRequestException('File size exceeds the 10MB limit');
      }

      if (!allowedTypes.includes(picture.mimetype)) {
        throw new BadRequestException(
          'Invalid file type. Only JPEG and PNG are allowed',
        );
      }

      updateProfileDTO.picture = picture;
    } else {
      updateProfileDTO.picture = null; // Handle no file uploaded
    }

    const myuser = await this.userService.getUserByUsername(req.user.username);
    const validUserEmail = await this.userService.getUserByEmail(
      updateProfileDTO.email,
    );

    if (
      updateProfileDTO.email &&
      validUserEmail?.email &&
      updateProfileDTO.email !== myuser?.email
    ) {
      throw new HttpException('Already Have Email', HttpStatus.NOT_ACCEPTABLE);
    }

    const user = await this.userService.updateProfile(
      req.user.username,
      updateProfileDTO,
    );
    return {
      message: 'Successfully Update Profile',
      data: user,
    };
  }

  @ApiOperation({ summary: 'Update Password Profile (Student,Teacher,Admin)' })
  @UseGuards(JwtAuthGuard)
  @Post('profile/update-password')
  async updatePassword(
    @Request() req: IRequest,
    @Body() resetPasswordDTO: ResetPasswordDTO,
  ) {
    if (resetPasswordDTO.password !== resetPasswordDTO.confirmPassword) {
      throw new HttpException('Password Not Match', HttpStatus.BAD_REQUEST);
    }
    const user = await this.userService.resetPasswordProfile(
      req.user.username,
      resetPasswordDTO,
    );
    return {
      message: 'Successfully Update Password Profile',
      data: user,
    };
  }

  @ApiOperation({ summary: 'Import File Excel (Admin, Teacher)' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: importFileExelDTO })
  @Post('file')
  async importExcel(
    @Request() req: IRequest,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet|application/vnd.ms-excel',
          }),
        ],
        exceptionFactory: () => new BadRequestException('Invalid file upload'),
      }),
    )
    file: Express.Multer.File,
  ) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.ADMIN,
      Role.TEACHER,
    ]);
    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const users: IFileFormat[] = [];
    const errors: string[] = [];

    // Parse the Excel file
    workbook.SheetNames.forEach((sheetName) => {
      const sheetData = XLSX.utils.sheet_to_json(
        workbook.Sheets[sheetName],
      ) as any[];

      sheetData.forEach((user: IFileFormat, rowIndex) => {
        const rowErrors: string[] = [];

        if (!user.studentId && user.role === 'student')
          rowErrors.push('กรุณาใส่ student ID');
        if (!user.firstname) rowErrors.push('กรุณาใส่ firstname');
        if (!user.lastname) rowErrors.push('กรุณาใส่ lastname');
        if (!user.gender || !['male', 'female', 'other'].includes(user.gender))
          rowErrors.push('gender ต้องเป็น "male", "female" หรือ "other"');
        if (!user.username) rowErrors.push('กรุณาใส่ username');
        if (user.role !== 'teacher' && user.role !== 'student')
          rowErrors.push('role ต้องเป็น "teacher" หรือ "student"');
        if (user.email && !/^\S+@\S+\.\S+$/.test(user.email)) {
          rowErrors.push('อีเมลล์ที่กรอกต้องเป็นรูปแบบอีเมมล์เท่านั้น');
        }

        if (rowErrors.length > 0) {
          errors.push(
            `Sheet "${sheetName}", แถว ${rowIndex + 2}: ${rowErrors.join(', ')}`,
          );
        } else {
          user.gender = user.gender.toUpperCase();
          user.role = user.role.toUpperCase();
          users.push({ ...user, validType: ValidateType.NOTEXIST });
        }
      });
    });

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Some rows contained errors',
        errors,
      });
    }

    const seen = new Map<string, IFileFormat[]>();
    const duplicates: IFileFormat[] = [];
    const processedUsers = users.map((user) => {
      const key = `${user.studentId}-${user.username}`;
      if (seen.has(key)) {
        seen.get(key)!.push(user);
        duplicates.push(user);
        return { ...user, validType: ValidateType.DUPLICATE };
      }
      seen.set(key, [user]);
      return { ...user, validType: ValidateType.NOTEXIST }; // Initial assumption
    });

    const finalUsers = await Promise.all(
      processedUsers.map(async (user) => {
        if (user.validType === ValidateType.DUPLICATE) return user;

        const existingUser = await this.userService.getUserByUsername(
          user.username,
        );
        const existingEmail = user.email
          ? await this.userService.getUserByEmail(user.email)
          : null;

        if (existingUser || existingEmail) {
          return {
            ...user,
            validType: ValidateType.EXIST,
          };
        }
        return user;
      }),
    );

    return {
      message: 'Excel file processed successfully',
      data: finalUsers,
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

  @ApiOperation({
    summary: 'Update IP Address And Active Status (Student,Teacher,Admin)',
  })
  @UseGuards(JwtAuthGuard)
  @Patch('realtime')
  async updateRealTime(
    @Request() req: IRequest,
    @Body() updateRealTimeDTO: UpdateRealTimeDTO,
  ) {
    const user = await this.userService.setRealTimeByUsername(
      req.user.username,
      updateRealTimeDTO,
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
  async updateUserByUsername(
    @Request() req: IRequest,
    @Param('username') username: string,
    @Body() updateUserDTO: UpdateUserDTO,
    @UploadedFile() picture?: Express.Multer.File,
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

    const validUserEmail = await this.userService.getUserByEmail(
      updateUserDTO.email,
    );

    if (
      validUserEmail &&
      updateUserDTO.email &&
      updateUserDTO.email !== validUser.email
    ) {
      throw new HttpException(
        'Already Have This Email',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    if (picture) {
      const maxSize = 50 * 1024 * 1024; // 10MB
      const allowedTypes = ['image/jpeg', 'image/png'];

      if (picture.size > maxSize) {
        throw new BadRequestException('File size exceeds the 10MB limit');
      }

      if (!allowedTypes.includes(picture.mimetype)) {
        throw new BadRequestException(
          'Invalid file type. Only JPEG and PNG are allowed',
        );
      }

      updateUserDTO.picture = picture;
    } else {
      updateUserDTO.picture = null; // Handle no file uploaded
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
