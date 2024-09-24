import { ApiProperty } from '@nestjs/swagger';

export class AddDateAssignmentDTO {
  @ApiProperty()
  startAt: Date;

  @ApiProperty()
  expireAt: Date;
}
