import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Patch,
} from '@nestjs/common';
import { SchoolService } from './school.service';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateSchoolDTO } from './dto/createSchool.dto';
import { UpdateSchoolDTO } from './dto/updateSchool.dto';
import { IRequest } from 'src/auth/interface/request.interface';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UtilsService } from 'src/utils/utils.service';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth()
@ApiTags('School')
@Controller('school')
export class SchoolController {
  constructor(
    private readonly schoolService: SchoolService,
    private readonly utilsService: UtilsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get All School (Admin)' })
  @Get()
  async getSchools(@Request() req: IRequest) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.ADMIN,
    ]);
    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }
    const schools = await this.schoolService.getAllSchool();
    return {
      message: 'Successfully get School',
      data: schools,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get Disable School And User(Admin)' })
  @Get('bin')
  async getDisableSchoolAndUser(@Request() req: IRequest) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.ADMIN,
    ]);
    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }

    const disabledData = await this.schoolService.getDisableSchoolAndUser();

    return {
      message: 'Successfully Get Disable School And Student',
      data: disabledData,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get School By Id (Admin)' })
  @Get(':id')
  async getSchoolsById(
    @Request() req: IRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.ADMIN,
    ]);
    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }

    const school = await this.schoolService.getSchoolById(id);
    if (!school) {
      throw new HttpException('School Not Found', HttpStatus.NOT_FOUND);
    }
    const teacherCount = school.users.filter(
      (user) => user.role === Role.TEACHER,
    );
    const studentCount = school.users.filter(
      (user) => user.role === Role.STUDENT,
    );

    return {
      message: 'Successfully Get School',
      data: {
        ...school,
        count: {
          student: studentCount.length,
          teacher: teacherCount.length,
        },
      },
    };
  }

  @ApiOperation({ summary: 'Get All Course By school Id (Admin)' })
  @UseGuards(JwtAuthGuard)
  @Get(':id/course')
  async getCourseBySchoolIdTeacher(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: IRequest,
  ) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.TEACHER,
    ]);

    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }

    const courses = await this.schoolService.getCourseBySchoolId(id);
    return {
      message: 'Successfully get Course By School Id',
      data: courses,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create School (Admin)' })
  @UseInterceptors(FileInterceptor('picture'))
  @ApiConsumes('multipart/form-data', 'application/json')
  @Post()
  async createSchool(
    @Request() req: IRequest,
    @Body() createSchoolDTO: CreateSchoolDTO,
    @UploadedFile() picture?: Express.Multer.File,
  ) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.ADMIN,
    ]);
    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }

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

      createSchoolDTO.picture = picture;
    } else {
      createSchoolDTO.picture = null; // Handle no file uploaded
    }
    const invalidSchool = await this.schoolService.getSchoolByName(
      createSchoolDTO.schoolName,
    );

    if (invalidSchool) {
      throw new HttpException(
        'Already Have School Name',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const school = await this.schoolService.createSchool(createSchoolDTO);
    return {
      message: 'Successfully Create School',
      data: school,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Edit School By Id (Admin)' })
  @UseInterceptors(FileInterceptor('picture'))
  @ApiConsumes('multipart/form-data', 'application/json')
  @Patch(':id')
  async updateSchoolById(
    @Request() req: IRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSchoolDTO: UpdateSchoolDTO,
    @UploadedFile() picture?: Express.Multer.File,
  ) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.ADMIN,
    ]);
    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }

    const invalidSchool = await this.schoolService.getSchoolById(id);

    if (!invalidSchool) {
      throw new HttpException('School Not Found', HttpStatus.NOT_FOUND);
    }

    const invalidSchoolName = await this.schoolService.getSchoolByName(
      updateSchoolDTO.schoolName,
    );

    if (
      !invalidSchoolName &&
      updateSchoolDTO.schoolName &&
      invalidSchool.schoolName !== updateSchoolDTO.schoolName
    ) {
      throw new HttpException(
        'Already Have This Name School',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

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

      updateSchoolDTO.picture = picture;
    } else {
      updateSchoolDTO.picture = null; // Handle no file uploaded
    }

    const school = await this.schoolService.updateSchoolById(
      id,
      updateSchoolDTO,
    );
    return {
      message: 'Update School Successfully',
      data: school,
    };
  }

  @ApiOperation({ summary: 'Get User By School Id (Student,Teacher,Admin)' })
  @UseGuards(JwtAuthGuard)
  @Get(':id/user')
  async getUserBySchoolId(@Param('id', ParseUUIDPipe) id: string) {
    const school = await this.schoolService.getSchoolById(id);
    if (!school) {
      throw new HttpException('School Not Found', HttpStatus.NOT_FOUND);
    }
    const users = await this.schoolService.getPeopleById(id);
    return {
      message: 'Successfully get User',
      data: users,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete School By Id (Admin)' })
  @Delete(':id')
  async deleteSchoolById(
    @Request() req: IRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.ADMIN,
    ]);
    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }

    const school = await this.schoolService.deleteSchoolById(id);
    if (!school) {
      throw new HttpException(
        'School Can Not Delete',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    return {
      message: 'Delete School Successfully',
    };
  }
}
