import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionSchoolDTO {
  @ApiProperty()
  schoolId: string;

  @ApiProperty()
  maxCreateTeacher: number;

  @ApiProperty()
  maxCreateStudent: number;

  @ApiProperty()
  maxCreateCoursePerTeacher: number;

  @ApiProperty()
  canCateaUsers: boolean;

  @ApiProperty()
  canUpdateUsers: boolean;

  @ApiProperty()
  canDeleteUsers: boolean;
}
