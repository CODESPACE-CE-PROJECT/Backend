import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReplyDTO } from './dto/createReply.dto';
import { UpdateReplyDTO } from './dto/updateReply.dto';

@Injectable()
export class ReplyService {
  constructor(private readonly prisma: PrismaService) {}

  async getReplyById(id: string) {
    try {
      const reply = await this.prisma.replyAnnounce.findFirst({
        where: {
          replyAnnounceId: id,
        },
      });
      return reply;
    } catch (error) {
      throw new Error('Error Fetch Reply');
    }
  }
  async getReplyByAnnounceId(announceId: string) {
    try {
      const reply = await this.prisma.replyAnnounce.findMany({
        where: {
          courseAnnounceId: announceId,
        },
        include: {
          user: true,
        },
      });
      return reply;
    } catch (error) {
      throw new Error('Error Fetch Reply');
    }
  }

  async createReplyByAnnounceId(
    createReplyDTO: CreateReplyDTO,
    username: string,
  ) {
    try {
      const reply = await this.prisma.replyAnnounce.create({
        data: {
          message: createReplyDTO.message,
          username: username,
          courseAnnounceId: createReplyDTO.courseAnnounceId,
        },
      });
      return reply;
    } catch (error) {
      throw new Error('Error Create Reply');
    }
  }

  async updateReplyById(updateReplyDTO: UpdateReplyDTO, id: string) {
    try {
      const reply = await this.prisma.replyAnnounce.update({
        where: {
          replyAnnounceId: id,
        },
        data: {
          message: updateReplyDTO.message,
        },
      });
      return reply;
    } catch (error) {
      throw new Error('Error Update Reply');
    }
  }

  async deleteReplyById(id: string) {
    try {
      const reply = await this.prisma.replyAnnounce.delete({
        where: {
          replyAnnounceId: id,
        },
      });
      return reply;
    } catch (error) {
      throw new Error('Error Delete Reply');
    }
  }
}
