import { ApiProperty } from '@nestjs/swagger';
import { AssignmentType } from '@prisma/client';

export class CreateAssigmentDTO {
  @ApiProperty()
  courseId: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ enum: ['EXERCISE', 'EXAMONLINE', 'EXAMONSITE'] })
  type: AssignmentType;

  @ApiProperty()
  announceDate: Date;

  @ApiProperty()
  startAt: Date;

  @ApiProperty()
  expireAt: Date;
}
