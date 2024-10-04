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
} from '@nestjs/common';
import { CodeSpaceService } from './code-space.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IRequest } from 'src/auth/interface/request.interface';
import { CreateCodeSpaceDTO } from './dto/createCodeSpace.dto';
import { UpdateCodeSpaceDTO } from './dto/updateCodeSpace.dto';

@ApiTags('Code Space')
@Controller('code-space')
export class CodeSpaceController {
  constructor(private readonly codeSpaceService: CodeSpaceService) {}

  @ApiOperation({
    summary: 'Get CodeSpace By Username Your Self (Teacher, Student, Admin)',
  })
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getCodeSpaceByUsername(@Request() req: IRequest) {
    const codespace = await this.codeSpaceService.getCodeSpaceByUsername(
      req.user.username,
    );
    if (codespace.length === 0) {
      throw new HttpException('Code Space Not Found', HttpStatus.NOT_FOUND);
    }
    return {
      message: 'Successfullly Get Code Space',
      data: codespace,
    };
  }

  @ApiOperation({
    summary: 'Create CodeSpace By Username Your Self (Teacher, Student, Admin)',
  })
  @UseGuards(AuthGuard('jwt'))
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
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async updateCodeSpceById(
    @Request() req: IRequest,
    @Body() updateCodeSpaceDTO: UpdateCodeSpaceDTO,
    @Param('id') id: string,
  ) {
    const invalidCodeSpace = await this.codeSpaceService.getCodeSpaceById(id);
    if (!invalidCodeSpace) {
      throw new HttpException('Code Space Not Found', HttpStatus.NOT_FOUND);
    }
    if (invalidCodeSpace.username !== req.user.username) {
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
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteCodeSpceById(@Request() req: IRequest, @Param('id') id: string) {
    const invalidCodeSpace = await this.codeSpaceService.getCodeSpaceById(id);
    if (!invalidCodeSpace) {
      throw new HttpException('Code Space Not Found', HttpStatus.NOT_FOUND);
    }
    if (invalidCodeSpace.username !== req.user.username) {
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
