import { ApiProperty } from '@nestjs/swagger';
import { AssignmentType } from '@prisma/client';

export class UpdateAssignmentDTO {
  @ApiProperty()
  title: string;

  @ApiProperty({ enum: ['EXERCISE', 'EXAMONLINE', 'EXAMONSITE'] })
  type: AssignmentType;

  @ApiProperty()
  startAt: Date;

  @ApiProperty()
  expireAt: Date;
}
