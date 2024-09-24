import { ApiProperty } from '@nestjs/swagger';

export class CreateAssigmentDTO {
  @ApiProperty()
  courseId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  type: string;
}
