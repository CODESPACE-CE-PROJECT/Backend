import { ApiProperty } from '@nestjs/swagger';

export class CreateAssigmentDTO {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  type: string;
}
