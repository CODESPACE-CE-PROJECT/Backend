import { ApiProperty } from '@nestjs/swagger';
import { PackageType } from '@prisma/client';

export class UpdateSchoolDTO {
  @ApiProperty()
  schoolName: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  picture: Express.Multer.File;

  @ApiProperty({ enum: ['STANDARD', 'PREMIUM'] })
  package: PackageType;

  @ApiProperty()
  isEnable: boolean;

  @ApiProperty()
  address: string;

  @ApiProperty()
  subdistrict: string;

  @ApiProperty()
  district: string;

  @ApiProperty()
  province: string;

  @ApiProperty()
  postCode: string;

  @ApiProperty()
  maxCreateTeacher: number;

  @ApiProperty()
  maxCreateStudent: number;

  @ApiProperty()
  maxCreateCoursePerTeacher: number;

  @ApiProperty()
  canCateaUser: boolean;

  @ApiProperty()
  canUpdateUser: boolean;

  @ApiProperty()
  canDeleteUser: boolean;
}
