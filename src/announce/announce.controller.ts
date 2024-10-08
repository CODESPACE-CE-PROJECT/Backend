import {
  Controller,
  Get,
  UseGuards,
  Request,
  Param,
  HttpException,
  HttpStatus,
  Post,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { AnnounceService } from './announce.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IRequest } from 'src/auth/interface/request.interface';
import { CreateAnnounceDTO } from './dto/createAnnounce.dto';
import { Role } from '@prisma/client';
import { UpdateAnnounceDTO } from './dto/updateAnnounce.dto';
import { CourseStudentService } from 'src/course-student/course-student.service';
import { CourseTeacherService } from 'src/course-teacher/course-teacher.service';
import { ReplyService } from 'src/reply/reply.service';
import { CreateReplyDTO } from 'src/reply/dto/createReply.dto';
import { UpdateReplyDTO } from 'src/reply/dto/updateReply.dto';

@ApiBearerAuth()
@ApiTags('Announce')
@Controller('announce')
export class AnnounceController {
  constructor(
    private readonly announceService: AnnounceService,
    private readonly courseStudentSercvice: CourseStudentService,
    private readonly courseTeacherService: CourseTeacherService,
    private readonly replyService: ReplyService,
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

    const courseTeacher =
      await this.courseTeacherService.getCourseTeacherByUsernameAndCourseId(
        req.user.username,
        createAnnnounceDTO.courseId,
      );

    if (!courseTeacher) {
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
        'Do Not Have Permission(Teahcer)',
        HttpStatus.FORBIDDEN,
      );
    }
    const invalidAnnounce = await this.announceService.getAnnouceById(id);
    if (!invalidAnnounce) {
      throw new HttpException('Announce Not Found', HttpStatus.NOT_FOUND);
    }

    const courseTeacher =
      await this.courseTeacherService.getCourseTeacherByUsernameAndCourseId(
        req.user.username,
        invalidAnnounce.courseId,
      );

    if (!courseTeacher) {
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
        'Do Not Have Permission(Teacher)',
        HttpStatus.FORBIDDEN,
      );
    }
    const invalidAnnounce = await this.announceService.getAnnouceById(id);
    if (!invalidAnnounce) {
      throw new HttpException('Announce Not Found', HttpStatus.NOT_FOUND);
    }

    const courseTeacher =
      await this.courseTeacherService.getCourseTeacherByUsernameAndCourseId(
        req.user.username,
        invalidAnnounce.courseId,
      );

    if (!courseTeacher) {
      throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
    }
    const announce = await this.announceService.deleteAnnounceById(id);

    return {
      message: 'Successfully Delete Announce',
      data: announce,
    };
  }

  @ApiOperation({
    summary: 'Create Reply Announce By Announce Id (Teacher, Student)',
  })
  @UseGuards(AuthGuard('jwt'))
  @Post('reply')
  async createReplyByAnnounceId(
    @Request() req: IRequest,
    @Body() createReplyDTO: CreateReplyDTO,
  ) {
    if (req.user.role !== Role.TEACHER && req.user.role !== Role.STUDENT) {
      throw new HttpException(
        'Do Not Have Permission(Teacher, Student)',
        HttpStatus.FORBIDDEN,
      );
    }

    const courseAnnounce = await this.announceService.getAnnouceById(
      createReplyDTO.courseAnnounceId,
    );
    if (!courseAnnounce) {
      throw new HttpException(
        'Course Announce Not Found',
        HttpStatus.NOT_FOUND,
      );
    }

    const courseTeacher =
      await this.courseTeacherService.getCourseTeacherByUsernameAndCourseId(
        req.user.username,
        courseAnnounce.courseId,
      );

    if (!courseTeacher) {
      throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
    }

    const reply = await this.replyService.createReplyByAnnounceId(
      createReplyDTO,
      req.user.username,
    );
    return {
      message: 'Create Reply Successfully',
      data: reply,
    };
  }

  @ApiOperation({
    summary: 'Get Reply Announce By Announce Id (Teacher, Student)',
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('reply/:announceId')
  async getReplyByAnnnounceId(
    @Request() req: IRequest,
    @Param('announceId') announceId: string,
  ) {
    const announce = await this.announceService.getAnnouceById(announceId);
    const courseStudent =
      await this.courseStudentSercvice.getCourseStudentByUsernameAndCourseId(
        req.user.username,
        announce?.courseId as string,
      );
    const courseTeacher =
      await this.courseTeacherService.getCourseTeacherByUsernameAndCourseId(
        req.user.username,
        announce?.courseId as string,
      );

    if (!courseStudent && !courseTeacher) {
      throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
    }

    const reply = await this.replyService.getReplyByAnnounceId(announceId);
    if (reply.length === 0) {
      throw new HttpException('Reply Not Found', HttpStatus.NOT_FOUND);
    }

    return {
      message: 'Successfully Get Reply',
      data: reply,
    };
  }

  @ApiOperation({
    summary: 'Update Reply By Reply Id (Teacher, Student)',
  })
  @UseGuards(AuthGuard('jwt'))
  @Patch('reply/edit/:id')
  async updateReplyAnnounceById(
    @Request() req: IRequest,
    @Param('id') id: string,
    @Body() updateReplyDTO: UpdateReplyDTO,
  ) {
    if (req.user.role !== Role.TEACHER && req.user.role !== Role.STUDENT) {
      throw new HttpException(
        'Do Not Have Permission(Teacher, Student)',
        HttpStatus.FORBIDDEN,
      );
    }

    const invalidReply = await this.replyService.getReplyById(id);
    if (!invalidReply) {
      throw new HttpException('Reply Not Found', HttpStatus.NOT_FOUND);
    }

    const announce = await this.announceService.getAnnouceById(
      invalidReply.courseAnnounceId,
    );
    const courseStudent =
      await this.courseStudentSercvice.getCourseStudentByUsernameAndCourseId(
        req.user.username,
        announce?.courseId as string,
      );
    const courseTeacher =
      await this.courseTeacherService.getCourseTeacherByUsernameAndCourseId(
        req.user.username,
        announce?.courseId as string,
      );

    if (!courseStudent && !courseTeacher) {
      throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
    }

    const reply = await this.replyService.updateReplyById(updateReplyDTO, id);

    return {
      message: 'Successfully Update Reply',
      data: reply,
    };
  }
}
