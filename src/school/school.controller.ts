import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { SchoolService } from './school.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateSchoolDTO } from './dto/createSchool.dto';
import { allowedNodeEnvironmentFlags } from 'process';
import { UpdateSchoolDTO } from './dto/updateSchool.dto';

@ApiTags('School')
@Controller('school')
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Get()
  async getSchools() {
    const schools = await this.schoolService.getAllSchool();
    return {
      message: 'Successfully get School',
      data: schools,
    };
  }

  @Get(':id')
  async getSchoolsById(@Param('id', ParseUUIDPipe) id: string) {
    const school = await this.schoolService.getSchoolById(id);
    if (!school) {
      throw new HttpException('School Not Found', HttpStatus.NOT_FOUND);
    }
    return {
      message: 'Successfully get School',
      data: school,
    };
  }

  @Post('create')
  async createSchool(@Body() createSchoolDTO: CreateSchoolDTO) {
    const school = await this.schoolService.createSchool(createSchoolDTO);
    return {
      message: 'Successfully Create School',
      data: school,
    };
  }

  @Put(':id')
  async updateSchoolById(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSchoolDTO: UpdateSchoolDTO,
  ) {
    const invalidSchool = await this.schoolService.getSchoolById(id);
    if (!invalidSchool) {
      throw new HttpException('School Not Found', HttpStatus.NOT_FOUND);
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
}
