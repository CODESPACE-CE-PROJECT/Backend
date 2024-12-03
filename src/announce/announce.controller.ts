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
import { ReplyService } from 'src/reply/reply.service';
import { CreateReplyDTO } from 'src/reply/dto/createReply.dto';
import { UpdateReplyDTO } from 'src/reply/dto/updateReply.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UtilsService } from 'src/utils/utils.service';
import { CourseService } from 'src/course/course.service';
import { join } from 'path';

@ApiBearerAuth()
@ApiTags('Announcement')
@Controller('announce')
export class AnnounceController {
  constructor(
    private readonly announceService: AnnounceService,
    private readonly utilsService: UtilsService,
    private readonly replyService: ReplyService,
    private readonly courseService: CourseService,
  ) {}

  @ApiOperation({
    summary: 'Get Announce By Course Id (Admin, Teacher, Student)',
  })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getAnnounceByCourseId(
    @Request() req: IRequest,
    @Param('id') id: string,
  ) {
    const announce = await this.announceService.getAnnouceById(id);

    if (!announce) {
      throw new HttpException('Announce Not Found', HttpStatus.NOT_FOUND);
    }

    const validTeacher = announce?.course.courseTeacher.find(
      (teacher) => teacher.username === req.user.username,
    );

    const validStudent = announce?.course.courseStudent.find(
      (student) => student.username === req.user.username,
    );

    if (!validTeacher && !validStudent) {
      throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
    }
    if (announce) {
      Reflect.deleteProperty(announce, 'course');
    }

    return {
      message: 'Successfully Get Announce',
      data: announce,
    };
  }

  @ApiOperation({
    summary: 'Create Announce By Course Id (Teacher)',
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  async createAnnounceByCourseId(
    @Request() req: IRequest,
    @Body() createAnnnounceDTO: CreateAnnounceDTO,
  ) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.TEACHER,
    ]);

    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }

    const course = await this.courseService.getCourseById(
      createAnnnounceDTO.courseId,
    );
    if (!course) {
      throw new HttpException('Course Not Found', HttpStatus.NOT_FOUND);
    }

    const validTeacher = course.courseTeacher.find(
      (teacher) => teacher.username === req.user.username,
    );

    if (!validTeacher) {
      throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
    }

    const announce = await this.announceService.createAnnounceByCourseId(
      createAnnnounceDTO,
      req.user.username,
    );

    return {
      message: 'Successfully Create Announce',
      data: announce,
    };
  }

  @ApiOperation({
    summary: 'Update Announce By Id (Teacher)',
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateAnnounceById(
    @Request() req: IRequest,
    @Param('id') id: string,
    @Body() updateAnnounceDTO: UpdateAnnounceDTO,
  ) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.TEACHER,
    ]);

    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }

    const validAnnounce = await this.announceService.getAnnouceById(id);

    if (!validAnnounce) {
      throw new HttpException('Announce Not Found', HttpStatus.NOT_FOUND);
    }

    const validTeacher = validAnnounce?.course.courseTeacher.find(
      (teacher) => teacher.username === req.user.username,
    );

    if (!validTeacher) {
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
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteAnnounceById(@Request() req: IRequest, @Param('id') id: string) {
    const resultPermit = await this.utilsService.checkPermissionRole(req, [
      Role.TEACHER,
    ]);

    if (resultPermit) {
      throw new HttpException(resultPermit, HttpStatus.FORBIDDEN);
    }

    const validAnnounce = await this.announceService.getAnnouceById(id);
    if (!validAnnounce) {
      throw new HttpException('Announce Not Found', HttpStatus.NOT_FOUND);
    }

    const validTeacher = validAnnounce?.course.courseTeacher.find(
      (teacher) => teacher.username === req.user.username,
    );

    if (!validTeacher) {
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
  @UseGuards(JwtAuthGuard)
  @Post('reply')
  async createReplyByAnnounceId(
    @Request() req: IRequest,
    @Body() createReplyDTO: CreateReplyDTO,
  ) {
    const announce = await this.announceService.getAnnouceById(
      createReplyDTO.courseAnnounceId,
    );

    if (!announce) {
      throw new HttpException('Announce Not Found', HttpStatus.NOT_FOUND);
    }

    const validTeacher = announce?.course.courseTeacher.find(
      (teacher) => teacher.username === req.user.username,
    );

    const validStudent = announce?.course.courseStudent.find(
      (student) => student.username === req.user.username,
    );

    if (!validTeacher && !validStudent) {
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
    summary: 'Update Reply By Reply Id (Teacher, Student)',
  })
  @UseGuards(JwtAuthGuard)
  @Patch('reply/:replyId')
  async updateReplyAnnounceById(
    @Request() req: IRequest,
    @Param('replyId') replyId: string,
    @Body() updateReplyDTO: UpdateReplyDTO,
  ) {
    const validReply = await this.replyService.getReplyById(replyId);

    if (!validReply) {
      throw new HttpException('Reply Not Found', HttpStatus.NOT_FOUND);
    }

    const validTeacher = validReply?.courseAnnounce.course.courseTeacher.find(
      (teacher) => teacher.username === req.user.username,
    );

    const validStudent = validReply?.courseAnnounce.course.courseStudent.find(
      (student) => student.username === req.user.username,
    );

    if (!validTeacher && !validStudent) {
      throw new HttpException('You Not In This Course', HttpStatus.BAD_REQUEST);
    }

    const reply = await this.replyService.updateReplyById(
      updateReplyDTO,
      replyId,
    );

    return {
      message: 'Successfully Update Reply',
      data: reply,
    };
  }
}
