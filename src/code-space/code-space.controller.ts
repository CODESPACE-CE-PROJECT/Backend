import {
  Controller,
  Get,
  UseGuards,
  Request,
  HttpException,
  Body,
  HttpStatus,
  Post,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CodeSpaceService } from './code-space.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IRequest } from 'src/auth/interface/request.interface';
import { CreateCodeSpaceDTO } from './dto/createCodeSpace.dto';
import { UpdateCodeSpaceDTO } from './dto/updateCodeSpace.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiBearerAuth()
@ApiTags('Code Space')
@Controller('code-space')
export class CodeSpaceController {
  constructor(private readonly codeSpaceService: CodeSpaceService) {}

  @ApiOperation({
    summary: 'Get CodeSpace By Username Your Self (Teacher, Student, Admin)',
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  async getCodeSpaceByUsername(@Request() req: IRequest) {
    const codespace = await this.codeSpaceService.getCodeSpaceByUsername(
      req.user.username,
    );

    return {
      message: 'Successfullly Get Code Space',
      data: codespace,
    };
  }

  @ApiOperation({
    summary: 'Create CodeSpace By Username Your Self (Teacher, Student, Admin)',
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  async createCodeSpaceByUsername(
    @Request() req: IRequest,
    @Body() createCodeSpaceDTO: CreateCodeSpaceDTO,
  ) {
    const codespace = await this.codeSpaceService.createCodeSpaceByUsername(
      req.user.username,
      createCodeSpaceDTO,
    );
    return {
      message: 'Successfullly Create Code Space',
      data: codespace,
    };
  }

  @ApiOperation({
    summary: 'Update CodeSpace By Username Your Self (Teacher, Student, Admin)',
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateCodeSpceById(
    @Request() req: IRequest,
    @Body() updateCodeSpaceDTO: UpdateCodeSpaceDTO,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const validCodeSpace = await this.codeSpaceService.getCodeSpaceById(id);
    if (!validCodeSpace) {
      throw new HttpException('Code Space Not Found', HttpStatus.NOT_FOUND);
    }
    if (validCodeSpace.username !== req.user.username) {
      throw new HttpException(
        'This Code Space Not Your',
        HttpStatus.BAD_REQUEST,
      );
    }

    const codespace = await this.codeSpaceService.updateCodeSpaceById(
      id,
      updateCodeSpaceDTO,
    );

    return {
      message: 'Successfullly Update Code Space',
      data: codespace,
    };
  }

  @ApiOperation({
    summary: 'Delete CodeSpace By Username Your Self (Teacher, Student, Admin)',
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteCodeSpceById(
    @Request() req: IRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const validCodeSpace = await this.codeSpaceService.getCodeSpaceById(id);
    if (!validCodeSpace) {
      throw new HttpException('Code Space Not Found', HttpStatus.NOT_FOUND);
    }
    if (validCodeSpace.username !== req.user.username) {
      throw new HttpException(
        'This Code Space Not Your',
        HttpStatus.BAD_REQUEST,
      );
    }

    const codespace = await this.codeSpaceService.deleteCodeSpaceById(id);

    return {
      message: 'Successfullly Update Code Space',
      data: codespace,
    };
  }
}
