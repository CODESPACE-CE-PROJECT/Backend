import {
  Controller,
  Get,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CourseService } from './course.service';
import { IRequest } from 'src/auth/interface/request.interface';
import { Role } from '@prisma/client';
import { CreateCourseDTO } from './dto/createCourse.dto';
import { PermissionService } from 'src/permission/permission.service';
import { UpdateCourseDTO } from './dto/updateCourse.dto';
import { AddUserToCourseDTO } from './dto/addUserToCourse.dto';
import { UserService } from 'src/user/user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UtilsService } from 'src/utils/utils.service';

@ApiBearerAuth()
@ApiTags('Course')
@Controller('course')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly permissionService: PermissionService,
    private readonly userService: UserService,
    private readonly utilsService: UtilsService,
  ) {}

  @ApiOperation({
    summary: 'Get All Course By Username Yourself (Admin, Teacher, Student)',
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllCourse(@Request() req: IRequest) {
    let course;
    if (req.user.role === Role.ADMIN) {
      course = await this.courseService.getAllCourse();
    } else {
      course = await this.courseService.getCourseByUsername(req.user.username);
    }
    return {
      message: 'Successfully Get Course',
      data: course,
    };
  }

  @ApiOperation({ summary: 'Get Course By Id (Teacher, Student)' })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getCourseById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: IRequest,
  ) {
    const course = await this.courseService.getCourseByIdAndUsername(
      id,
      req.user.username,
    );
    if (!course) {
      throw new HttpException('Course Not Found', HttpStatus.NOT_FOUND);
    }

    if (!course.courseTeacher || !course.courseStudent) {
      throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
    }
    Reflect.deleteProperty(course, 'courseStudent');
    Reflect.deleteProperty(course, 'courseTeacher');
    return {
      message: 'Successfully Get Course',
      data: course,
    };
  }

  @ApiOperation({ summary: 'Get All Course By school Id (Teacher)' })
  @UseGuards(JwtAuthGuard)
  @Get('school/teacher')
  async getCourseBySchoolIdTeacher(@Request() req: IRequest) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.TEACHER,
    ]);

    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }

    const courses = await this.courseService.getCourseBySchoolId(
      req.user.schoolId,
    );
    return {
      message: 'Successfully get Course By School Id',
      data: courses,
    };
  }

  @ApiOperation({
    summary: 'Get People By Course Id (Teacher, Student)',
  })
  @UseGuards(JwtAuthGuard)
  @Get(':id/people')
  async getPeopleByCourseId(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: IRequest,
  ) {
    const course = await this.courseService.getPeopleInCourseByCourseId(id);
    if (!course) {
      throw new HttpException('Course Not Found', HttpStatus.NOT_FOUND);
    }

    if (req.user.schoolId !== course.schoolId) {
      throw new HttpException(
        'This Course Not In Your School',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      message: 'Successfully Get Course',
      data: course,
    };
  }

  @ApiOperation({ summary: 'Create Course (Teacher)' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('picture'))
  @ApiConsumes('multipart/form-data', 'application/json')
  @Post()
  async createCourse(
    @Body() createCourseDTO: CreateCourseDTO,
    @Request() req: IRequest,
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
      Role.TEACHER,
    ]);

    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }

    const validCourse = await this.courseService.getCourseByTitle(
      createCourseDTO.title,
    );
    if (validCourse) {
      throw new HttpException(
        'Already Have This Title Course',
        HttpStatus.BAD_REQUEST,
      );
    }

    const countCourse = await this.courseService.countCourseByUsername(
      req.user.username,
    );
    const permission = await this.permissionService.getPermissionBySchoolId(
      req.user.schoolId,
    );

    const limitCourse = permission?.maxCreateCoursePerTeacher as number;

    if (countCourse >= limitCourse) {
      throw new HttpException(
        `Over limit Create Course Per Teacher ${limitCourse}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    createCourseDTO.picture = picture;
    const course = await this.courseService.createCourse(
      createCourseDTO,
      req.user.username,
      req.user.schoolId,
    );
    return {
      message: 'Successfully Create Course',
      data: course,
    };
  }

  @ApiOperation({ summary: 'Update Course By Id (Teacher)' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('picture'))
  @ApiConsumes('multipart/form-data', 'application/json')
  @Patch(':id')
  async updateCourseById(
    @Request() req: IRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCourseDTO: UpdateCourseDTO,
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
      Role.TEACHER,
    ]);

    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }

    const course = await this.courseService.getCourseByIdAndUsername(
      id,
      req.user.username,
    );
    if (!course) {
      throw new HttpException('Course Not Found', HttpStatus.NOT_FOUND);
    }

    if (!course.courseTeacher) {
      throw new HttpException(
        'You Can Not Edit This Course',
        HttpStatus.BAD_REQUEST,
      );
    }

    updateCourseDTO.picture = picture;

    const updatedCourse = await this.courseService.updateCourseById(
      updateCourseDTO,
      id,
    );
    return {
      message: 'Successfully Update Course',
      data: updatedCourse,
    };
  }

  @ApiOperation({ summary: 'Add People To Course (Teacher)' })
  @UseGuards(JwtAuthGuard)
  @Post('add')
  async addStudentToCourse(
    @Body() addUserToCourseDTO: AddUserToCourseDTO,
    @Request() req: IRequest,
  ) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.TEACHER,
    ]);

    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }

    const user = await Promise.all(
      addUserToCourseDTO.users.map(async (username) => {
        const user = await this.userService.getUserByUsername(username);
        return {
          username: user?.username,
          valid: user !== null,
          role: user?.role,
          isInCourse: await this.courseService.getCourseByIdAndUsername(
            addUserToCourseDTO.courseId,
            username,
          ),
        };
      }),
    );

    if (user.find((user) => !user.valid)) {
      throw new HttpException('User Not Found', HttpStatus.BAD_REQUEST);
    }

    if (user.find((user) => user.isInCourse)) {
      throw new HttpException(
        'Some User Already In Course',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (user.find((user) => user.role === Role.ADMIN) !== undefined) {
      throw new HttpException(
        'In List Has Admin Account',
        HttpStatus.BAD_REQUEST,
      );
    }

    const course = await this.courseService.getCourseById(
      addUserToCourseDTO.courseId,
    );

    if (!course) {
      throw new HttpException('Course Not Found', HttpStatus.NOT_FOUND);
    }

    await this.courseService.addPeopleToCourse(addUserToCourseDTO);

    return {
      message: 'Successfully Add User To Course',
    };
  }

  @ApiOperation({
    summary: 'Delete User From Course By Course Id And Username (Teacher)',
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id/user/:username')
  async deleteStudentFromCourse(
    @Request() req: IRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('username') username: string,
  ) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.TEACHER,
    ]);

    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }

    const deleteUser = await this.courseService.deleteUserFromCourse(
      id,
      username,
      req,
    );
    if (deleteUser === 'User Not Found In Course') {
      throw new HttpException('User Not Found In Course', HttpStatus.NOT_FOUND);
    }

    if (deleteUser === 'Can Not Delete Your Self From Course') {
      throw new HttpException(
        'Can Not Delete Your Self From Course',
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      message: 'Delete User From Course Successfully',
      data: deleteUser,
    };
  }

  @ApiOperation({
    summary: 'Delete Course By Id (Teacher)',
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteCourseById(
    @Request() req: IRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.TEACHER,
    ]);

    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }
    const course = await this.courseService.deleteCourseById(id);
    if (!course) {
      throw new HttpException('Course Not Found', HttpStatus.NOT_FOUND);
    }
    return {
      message: 'Delete Course Successfully',
      data: course,
    };
  }
}
