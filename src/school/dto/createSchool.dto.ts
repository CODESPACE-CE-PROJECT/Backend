import { ApiProperty } from '@nestjs/swagger';
import { PackageType } from '@prisma/client';

export class CreateSchoolDTO {
  @ApiProperty()
  schoolName: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  picture: Express.Multer.File | null;

  @ApiProperty({ enum: ['STANDARD', 'PREMIUM'] })
  package: PackageType;

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
