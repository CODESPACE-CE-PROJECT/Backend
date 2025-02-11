import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PackageType } from '@prisma/client';

export class UpdateSchoolDTO {
  @ApiPropertyOptional()
  schoolName: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  picture: Express.Multer.File | null;

  @ApiPropertyOptional({ enum: ['STANDARD', 'PREMIUM'] })
  package: PackageType;

  @ApiPropertyOptional()
  isEnable: boolean;

  @ApiPropertyOptional()
  address: string;

  @ApiPropertyOptional()
  subDistrict: string;

  @ApiPropertyOptional()
  district: string;

  @ApiPropertyOptional()
  province: string;

  @ApiPropertyOptional()
  postCode: string;

  @ApiPropertyOptional()
  maxCreateTeacher: number;

  @ApiPropertyOptional()
  maxCreateStudent: number;

  @ApiPropertyOptional()
  maxCreateCoursePerTeacher: number;

  @ApiPropertyOptional()
  canCreateUser: boolean;

  @ApiPropertyOptional()
  canUpdateUser: boolean;

  @ApiPropertyOptional()
  canDeleteUser: boolean;
}
