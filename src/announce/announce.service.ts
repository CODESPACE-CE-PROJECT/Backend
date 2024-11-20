import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAnnounceDTO } from './dto/createAnnounce.dto';
import { UpdateCourseDTO } from 'src/course/dto/updateCourse.dto';

@Injectable()
export class AnnounceService {
  constructor(private readonly prisma: PrismaService) {}

  async getAnnouceById(id: string) {
    try {
      const announce = await this.prisma.courseAnnounce.findFirst({
        where: {
          courseAnnounceId: id,
        },
      });
      return announce;
    } catch (error) {
      throw new Error('Error Fetch Announce');
    }
  }

  async getAnnouceByCourseId(courseId: string) {
    try {
      const announce = await this.prisma.courseAnnounce.findMany({
        where: {
          courseId: courseId,
        },
      });
      return announce;
    } catch (error) {
      throw new Error('Error Fetch Announce');
    }
  }

  async createAnnounceByCourseId(
    createAnnounceDTO: CreateAnnounceDTO,
    username: string,
  ) {
    try {
      const announce = await this.prisma.courseAnnounce.create({
        data: {
          courseId: createAnnounceDTO.courseId,
          description: createAnnounceDTO.description,
          username: username,
        },
      });
      return announce;
    } catch (error) {
      throw new Error('Error Create Announce');
    }
  }

  async updateAnnounceById(id: string, updateAnnounceDTO: UpdateCourseDTO) {
    try {
      const announce = await this.prisma.courseAnnounce.update({
        where: {
          courseAnnounceId: id,
        },
        data: {
          description: updateAnnounceDTO.description,
        },
      });
      return announce;
    } catch (error) {
      throw new Error('Error Update Announce');
    }
  }

  async deleteAnnounceById(id: string) {
    try {
      const announce = await this.prisma.courseAnnounce.delete({
        where: {
          courseAnnounceId: id,
        },
      });
      return announce;
    } catch (error) {
      throw new Error('Error Delete Announce');
    }
  }
}
