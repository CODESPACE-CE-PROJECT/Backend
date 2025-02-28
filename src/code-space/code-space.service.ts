import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCodeSpaceDTO } from './dto/createCodeSpace.dto';
import { UpdateCodeSpaceDTO } from './dto/updateCodeSpace.dto';

@Injectable()
export class CodeSpaceService {
  constructor(private readonly prisma: PrismaService) {}

  async getCodeSpaceById(id: string) {
    try {
      const codespace = await this.prisma.codeSpace.findUnique({
        where: {
          codeSpaceId: id,
        },
      });
      return codespace;
    } catch (error) {
      throw new Error('Error Fetch Code Space');
    }
  }

  async getCodeSpaceByUsername(username: string) {
    try {
      const codespace = await this.prisma.codeSpace.findMany({
        where: {
          username: username,
        },
        orderBy: {
          codeSpaceId: 'desc',
        },
      });
      return codespace;
    } catch (error) {
      throw new Error('Error Fetch Code Space');
    }
  }

  async createCodeSpaceByUsername(
    username: string,
    createCodeSpaceDTO: CreateCodeSpaceDTO,
  ) {
    try {
      const codespace = await this.prisma.codeSpace.create({
        data: {
          language: createCodeSpaceDTO.language,
          sourceCode: createCodeSpaceDTO.sourceCode,
          fileName: createCodeSpaceDTO.filename,
          username: username,
        },
      });
      return codespace;
    } catch (error) {
      throw new Error('Error Create Code Space');
    }
  }

  async updateCodeSpaceById(
    id: string,
    updateCodeSpaceDTO: UpdateCodeSpaceDTO,
  ) {
    try {
      const codespace = await this.prisma.codeSpace.update({
        where: {
          codeSpaceId: id,
        },
        data: {
          language: updateCodeSpaceDTO.language,
          sourceCode: updateCodeSpaceDTO.sourceCode,
          fileName: updateCodeSpaceDTO.filename,
        },
      });
      return codespace;
    } catch (error) {
      throw new Error('Error Update Code Space');
    }
  }

  async deleteCodeSpaceById(id: string) {
    try {
      const codespace = await this.prisma.codeSpace.delete({
        where: {
          codeSpaceId: id,
        },
      });
      return codespace;
    } catch (error) {
      throw new Error('Error Delete Code Space');
    }
  }
}
