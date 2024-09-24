import { ApiProperty } from '@nestjs/swagger';

export class UpdateAssignmentDTO {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  type: string;
}
