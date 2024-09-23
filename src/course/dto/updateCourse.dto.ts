import { ApiProperty } from '@nestjs/swagger';

export class UpdateCourseDTO {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;
}
