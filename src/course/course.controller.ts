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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseService } from './course.service';
import { AuthGuard } from '@nestjs/passport';
import { IRequest } from 'src/auth/interface/request.interface';
import { Role } from '@prisma/client';
import { CreateCourseDTO } from './dto/createCourse.dto';
import { PermissionService } from 'src/permission/permission.service';
import { UpdateCourseDTO } from './dto/updateCourse.dto';
import { AddUserToCourseDTO } from './dto/addUserToCourse.dto';
import { UserService } from 'src/user/user.service';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth()
@ApiTags('Course')
@Controller('course')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly permissionService: PermissionService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({ summary: 'Get All Course (Admin)' })
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAllCourse(@Request() req: IRequest) {
    if (req.user.role !== Role.ADMIN) {
      throw new HttpException(
        'Do Not Have Permission(Admin)',
        HttpStatus.FORBIDDEN,
      );
    }
    const course = await this.courseService.getAllCourse();
    return {
      message: 'Successfully Get Course',
      data: course,
    };
  }

  @ApiOperation({ summary: 'Get Course By Id (Admin, Teacher, Student)' })
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getCourseById(@Param('id') id: string, @Request() req: IRequest) {
    const course = await this.courseService.getCourseById(id);
    if (!course) {
      throw new HttpException('Course Not Found', HttpStatus.NOT_FOUND);
    }
    if (
      req.user.schoolId !== course?.schoolId &&
      (req.user.role === Role.STUDENT || req.user.role === Role.TEACHER)
    ) {
      throw new HttpException(
        'You Can Not Get Course Not In Your School',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      message: 'Successfully Get Course',
      data: course,
    };
  }

  @ApiOperation({ summary: 'Get All Course By school Id (Teacher)' })
  @UseGuards(AuthGuard('jwt'))
  @Get('school/myid')
  async getCourseBySchoolIdTeacher(@Request() req: IRequest) {
    if (req.user.role !== Role.TEACHER) {
      throw new HttpException(
        'Do Not Have Permission(Teacher)',
        HttpStatus.FORBIDDEN,
      );
    }

    const courses = await this.courseService.getCourseBySchoolId(
      req.user.schoolId,
    );
    return {
      message: 'Successfully get Course By School Id',
      data: courses,
    };
  }

  @ApiOperation({ summary: 'Get All Course By school Id (Admin)' })
  @UseGuards(AuthGuard('jwt'))
  @Get('school/:schoolId')
  async getCourseBySchoolId(
    @Request() req: IRequest,
    @Param('schoolId') schoolId: string,
  ) {
    if (req.user.role !== Role.ADMIN) {
      throw new HttpException(
        'Do Not Have Permission(ADMIN)',
        HttpStatus.FORBIDDEN,
      );
    }
    const courses = await this.courseService.getCourseBySchoolId(schoolId);
    return {
      message: 'Successfully get Course By School Id',
      data: courses,
    };
  }

  @ApiOperation({ summary: 'Get All Course By Username (Teacher, Student)' })
  @UseGuards(AuthGuard('jwt'))
  @Get('/username/myid')
  async getCourseByUsername(@Request() req: IRequest) {
    if (req.user.role !== Role.TEACHER && req.user.role !== Role.STUDENT) {
      throw new HttpException(
        'Do Not Have Permission(Teacher, Student)',
        HttpStatus.FORBIDDEN,
      );
    }
    const courses = await this.courseService.getCourseByUsername(
      req.user.username,
      req.user.role,
    );
    return {
      message: 'Successfully get Course By Username',
      data: courses,
    };
  }

  @ApiOperation({
    summary: 'Get People By Course Id (Teacher, Student)',
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('/people/:id')
  async getPeopleByCourseId(@Param('id') id: string, @Request() req: IRequest) {
    const course = await this.courseService.getCourseById(id);
    if (!course) {
      throw new HttpException('Course Not Found', HttpStatus.NOT_FOUND);
    }

    if (req.user.schoolId !== course.schoolId) {
      throw new HttpException(
        'This Course Not In Your School',
        HttpStatus.BAD_REQUEST,
      );
    }
    const student = await this.courseService.getStudentInCourseByCourseId(id);
    const teacher = await this.courseService.getTeacherInCourseByCourseId(id);

    if (
      student.find((data) => data.username === req.user.username) == null &&
      teacher.find((data) => data.username === req.user.username) == null
    ) {
      throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
    }

    return {
      message: 'Successfully Get Course',
      data: {
        teacher: teacher,
        student: student,
      },
    };
  }

  @ApiOperation({ summary: 'createCourse (Teacher)' })
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('background'))
  @Post()
  async createCourse(
    @Body() createCourseDTO: CreateCourseDTO,
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
    background: Express.Multer.File,
  ) {
    if (req.user.role !== Role.TEACHER) {
      throw new HttpException(
        'Do Not Have Permission(Teacher)',
        HttpStatus.FORBIDDEN,
      );
    }
    const invalidCourse = await this.courseService.getCourseByTitle(
      createCourseDTO.title,
    );
    if (invalidCourse) {
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
    const course = await this.courseService.createCourse(
      createCourseDTO,
      req.user.username,
      req.user.schoolId,
      background,
    );
    return {
      message: 'Successfully Create Course',
      data: course,
    };
  }

  @ApiOperation({ summary: 'update Course By Id (Teacher)' })
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async updateCourseById(
    @Request() req: IRequest,
    @Param('id') id: string,
    @Body() updateCourseDTO: UpdateCourseDTO,
  ) {
    if (req.user.role !== Role.TEACHER) {
      throw new HttpException(
        'Do Not Have Permission(Teacher)',
        HttpStatus.FORBIDDEN,
      );
    }

    const course = await this.courseService.getCourseById(id);
    if (!course) {
      throw new HttpException('Course Not Found', HttpStatus.NOT_FOUND);
    }

    if (course.schoolId !== req.user.schoolId) {
      throw new HttpException(
        'You Can Not Edit Course Not In Your School',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedCourse = await this.courseService.updateCourse(
      updateCourseDTO,
      id,
    );
    return {
      message: 'Successfully',
      data: updatedCourse,
    };
  }

  @ApiOperation({ summary: 'Add Student To Course (Teacher)' })
  @UseGuards(AuthGuard('jwt'))
  @Post('/add/student')
  async addStudentToCourse(
    @Body() addUserToCourseDTO: AddUserToCourseDTO,
    @Request() req: IRequest,
  ) {
    if (req.user.role !== Role.TEACHER) {
      throw new HttpException(
        'Do Not Have Permission(Teacher)',
        HttpStatus.FORBIDDEN,
      );
    }
    const user = await this.userService.getUserByUsername(
      addUserToCourseDTO.username,
    );

    if (user?.role !== Role.STUDENT) {
      throw new HttpException('User Is Not Student', HttpStatus.BAD_REQUEST);
    }
    const course = await this.courseService.getCourseById(
      addUserToCourseDTO.courseId,
    );
    if (!course) {
      throw new HttpException('Course Not Found', HttpStatus.NOT_FOUND);
    }

    const courseStudent =
      await this.courseService.addStudentToCourse(addUserToCourseDTO);

    return {
      message: 'Successfully Create Course',
      data: courseStudent,
    };
  }

  @ApiOperation({ summary: 'Add Teacher To Course (Teacher)' })
  @UseGuards(AuthGuard('jwt'))
  @Post('/add/teacher')
  async addTeacherToCourse(
    @Body() addUserToCourseDTO: AddUserToCourseDTO,
    @Request() req: IRequest,
  ) {
    if (req.user.role !== Role.TEACHER) {
      throw new HttpException(
        'Do Not Have Permission(Teacher)',
        HttpStatus.FORBIDDEN,
      );
    }
    const user = await this.userService.getUserByUsername(
      addUserToCourseDTO.username,
    );

    if (user?.role !== Role.TEACHER) {
      throw new HttpException('User Is Not Teacher', HttpStatus.BAD_REQUEST);
    }
    const course = await this.courseService.getCourseById(
      addUserToCourseDTO.courseId,
    );
    if (!course) {
      throw new HttpException('Course Not Found', HttpStatus.NOT_FOUND);
    }

    const courseTeacher =
      await this.courseService.addTeacherToCourse(addUserToCourseDTO);

    return {
      message: 'Successfully Create Course',
      data: courseTeacher,
    };
  }

  @ApiOperation({
    summary: 'Delete User From Course By Course User Id (Teacher)',
  })
  @UseGuards(AuthGuard('jwt'))
  @Delete('delete/user/:courseUserId')
  async deleteStudentFromCourse(
    @Request() req: IRequest,
    @Param('courseUserId') id: string,
  ) {
    if (req.user.role !== Role.TEACHER) {
      throw new HttpException(
        'Do Not Have Permission(Teacher)',
        HttpStatus.FORBIDDEN,
      );
    }

    const deleteUser = await this.courseService.deleteUserFromCourse(
      id,
      req.user.username,
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
  @UseGuards(AuthGuard('jwt'))
  @Delete('delete/:id')
  async deleteCourseById(@Request() req: IRequest, @Param('id') id: string) {
    if (req.user.role !== Role.TEACHER) {
      throw new HttpException(
        'Do Not Have Permission(Teacher)',
        HttpStatus.FORBIDDEN,
      );
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
