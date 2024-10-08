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
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SchoolService } from './school.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateSchoolDTO } from './dto/createSchool.dto';
import { UpdateSchoolDTO } from './dto/updateSchool.dto';
import { AuthGuard } from '@nestjs/passport';
import { IRequest } from 'src/auth/interface/request.interface';
import { Role } from '@prisma/client';
import { CreatePermissionSchoolDTO } from 'src/permission/dto/createPermissionSchool.dto';
import { UpdatePermissionSchoolDTO } from 'src/permission/dto/upatePermissionSchool.dto';
import { PermissionService } from 'src/permission/permission.service';

@ApiBearerAuth()
@ApiTags('School')
@Controller('school')
export class SchoolController {
  constructor(
    private readonly schoolService: SchoolService,
    private readonly permissionService: PermissionService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get All School (Admin)' })
  @Get()
  async getSchools(@Request() req: IRequest) {
    if (req.user.role !== Role.ADMIN) {
      throw new HttpException(
        'Do Not Have Permission(Admin)',
        HttpStatus.FORBIDDEN,
      );
    }

    const schools = await this.schoolService.getAllSchool();
    return {
      message: 'Successfully get School',
      data: schools,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get School By Id (Admin)' })
  @Get(':id')
  async getSchoolsById(
    @Request() req: IRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    if (req.user.role !== Role.ADMIN) {
      throw new HttpException(
        'Do Not Have Permission(Admin)',
        HttpStatus.FORBIDDEN,
      );
    }

    const school = await this.schoolService.getSchoolById(id);
    if (!school) {
      throw new HttpException('School Not Found', HttpStatus.NOT_FOUND);
    }
    return {
      message: 'Successfully get School',
      data: school,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create School (Admin)' })
  @Post()
  async createSchool(
    @Request() req: IRequest,
    @Body() createSchoolDTO: CreateSchoolDTO,
  ) {
    if (req.user.role !== Role.ADMIN) {
      throw new HttpException(
        'Do Not Have Permission(Admin)',
        HttpStatus.FORBIDDEN,
      );
    }

    const school = await this.schoolService.createSchool(createSchoolDTO);
    return {
      message: 'Successfully Create School',
      data: school,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create Permission School (Admin)' })
  @Post('permission')
  async createPermissionSchool(
    @Request() req: IRequest,
    @Body()
    createPermissionSchoolDTO: CreatePermissionSchoolDTO,
  ) {
    if (req.user.role !== Role.ADMIN) {
      throw new HttpException(
        'Do Not Have Permission(Admin)',
        HttpStatus.FORBIDDEN,
      );
    }

    const invalidSchool = await this.schoolService.getSchoolById(
      createPermissionSchoolDTO.schoolId,
    );
    if (!invalidSchool) {
      throw new HttpException('School Not Found', HttpStatus.NOT_FOUND);
    }
    const school = await this.permissionService.createPermisssionSchoolById(
      createPermissionSchoolDTO,
    );
    return {
      message: 'Successfully Create Permission School',
      data: school,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Edit Permission School By Id (Admin)' })
  @Put('permission/edit/:id')
  async updatePermissionSchoolById(
    @Request() req: IRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePermissionSchoolDTO: UpdatePermissionSchoolDTO,
  ) {
    if (req.user.role !== Role.ADMIN) {
      throw new HttpException(
        'Do Not Have Permission(Admin)',
        HttpStatus.FORBIDDEN,
      );
    }

    const permission = await this.permissionService.updatePermissionSchoolById(
      updatePermissionSchoolDTO,
      id,
    );

    if (!permission) {
      throw new HttpException(
        'Permission School Not Found',
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      message: 'Update Permission School Successfully',
      data: permission,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Edit School By Id (Admin)' })
  @Put(':id')
  async updateSchoolById(
    @Request() req: IRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSchoolDTO: UpdateSchoolDTO,
  ) {
    if (req.user.role !== Role.ADMIN) {
      throw new HttpException(
        'Do Not Have Permission(Admin)',
        HttpStatus.FORBIDDEN,
      );
    }

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

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Delete School By Id (Admin)' })
  @Delete(':id')
  async deleteSchoolById(@Request() req: IRequest, @Param('id') id: string) {
    if (req.user.role !== Role.ADMIN) {
      throw new HttpException(
        'Do Not Have Permission(Admin)',
        HttpStatus.FORBIDDEN,
      );
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
