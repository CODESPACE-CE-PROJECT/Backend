import {
  Controller,
  Get,
  UseGuards,
  Request,
  Param,
  HttpException,
  HttpStatus,
  Post,
  Bind,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { AnnounceService } from './announce.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IRequest } from 'src/auth/interface/request.interface';
import { CreateAnnounceDTO } from './dto/createAnnounce.dto';
import { Role } from '@prisma/client';
import { UpdateAnnounceDTO } from './dto/updateAnnounce.dto';
import { CourseStudentService } from 'src/course-student/course-student.service';
import { CourseTeacherService } from 'src/course-teacher/course-teacher.service';

@ApiTags('Announce')
@Controller('announce')
export class AnnounceController {
  constructor(
    private readonly announceService: AnnounceService,
    private readonly courseStudentSercvice: CourseStudentService,
    private readonly courseTeacherService: CourseTeacherService,
  ) {}

  @ApiOperation({
    summary: 'Get Announce By Course Id (Admin, Teacher, Student)',
  })
  @UseGuards(AuthGuard('jwt'))
  @Get(':courseId')
  async getAnnounceByCourseId(
    @Request() req: IRequest,
    @Param('courseId') courseId: string,
  ) {
    const courseStudent =
      await this.courseStudentSercvice.getCourseStudentByUsernameAndCourseId(
        req.user.username,
        courseId,
      );
    const courseTeacher =
      await this.courseTeacherService.getCourseTeacherByUsernameAndCourseId(
        req.user.username,
        courseId,
      );
    if (!courseStudent && !courseTeacher) {
      throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
    }

    const announce = await this.announceService.getAnnouceByCourseId(courseId);
    if (announce.length === 0) {
      throw new HttpException('Announce Not Found', HttpStatus.NOT_FOUND);
    }
    return {
      message: 'Successfully Get Announce',
      data: announce,
    };
  }

  @ApiOperation({
    summary: 'Create Announce By Course Id (Teacher)',
  })
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createAnnounceByCourseId(
    @Request() req: IRequest,
    @Body() createAnnnounceDTO: CreateAnnounceDTO,
  ) {
    if (req.user.role !== Role.TEACHER) {
      throw new HttpException(
        'Do Not Have Permission(Teacher)',
        HttpStatus.FORBIDDEN,
      );
    }

    const courseStudent =
      await this.courseStudentSercvice.getCourseStudentByUsernameAndCourseId(
        req.user.username,
        createAnnnounceDTO.courseId,
      );
    const courseTeacher =
      await this.courseTeacherService.getCourseTeacherByUsernameAndCourseId(
        req.user.username,
        createAnnnounceDTO.courseId,
      );

    if (!courseStudent && !courseTeacher) {
      throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
    }

    const announce = await this.announceService.createAnnounceByCourseId(
      createAnnnounceDTO,
      req.user.username,
    );
    return {
      message: 'Successfully Get Announce',
      data: announce,
    };
  }

  @ApiOperation({
    summary: 'Update Announce By Id (Teacher)',
  })
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async updateAnnounceById(
    @Request() req: IRequest,
    @Param('id') id: string,
    @Body() updateAnnounceDTO: UpdateAnnounceDTO,
  ) {
    if (req.user.role !== Role.TEACHER) {
      throw new HttpException(
        'Do Not Have Permission(Admin)',
        HttpStatus.FORBIDDEN,
      );
    }
    const invalidAnnounce = await this.announceService.getAnnouceById(id);
    if (!invalidAnnounce) {
      throw new HttpException('Announce Not Found', HttpStatus.NOT_FOUND);
    }
    const courseStudent =
      await this.courseStudentSercvice.getCourseStudentByUsernameAndCourseId(
        req.user.username,
        invalidAnnounce.courseId,
      );
    const courseTeacher =
      await this.courseTeacherService.getCourseTeacherByUsernameAndCourseId(
        req.user.username,
        invalidAnnounce.courseId,
      );

    if (!courseStudent && !courseTeacher) {
      throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
    }

    const announce = await this.announceService.updateAnnounceById(
      id,
      updateAnnounceDTO,
    );

    return {
      message: 'Successfully Update Announce',
      data: announce,
    };
  }

  @ApiOperation({
    summary: 'Delete Announce By Id (Teacher)',
  })
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteAnnounceById(@Request() req: IRequest, @Param('id') id: string) {
    if (req.user.role !== Role.TEACHER) {
      throw new HttpException(
        'Do Not Have Permission(Admin)',
        HttpStatus.FORBIDDEN,
      );
    }
    const invalidAnnounce = await this.announceService.getAnnouceById(id);
    if (!invalidAnnounce) {
      throw new HttpException('Announce Not Found', HttpStatus.NOT_FOUND);
    }

    const courseStudent =
      await this.courseStudentSercvice.getCourseStudentByUsernameAndCourseId(
        req.user.username,
        invalidAnnounce.courseId,
      );
    const courseTeacher =
      await this.courseTeacherService.getCourseTeacherByUsernameAndCourseId(
        req.user.username,
        invalidAnnounce.courseId,
      );

    if (!courseStudent && !courseTeacher) {
      throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
    }
    const announce = await this.announceService.deleteAnnounceById(id);

    return {
      message: 'Successfully Delete Announce',
      data: announce,
    };
  }
}
