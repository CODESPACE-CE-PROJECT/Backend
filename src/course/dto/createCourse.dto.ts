import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDTO {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;
}
