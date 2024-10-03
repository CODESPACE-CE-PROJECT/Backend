import { ApiProperty } from '@nestjs/swagger';

export class Constraint {
  @ApiProperty()
  type: string;

  @ApiProperty()
  keyword: string;

  @ApiProperty()
  qunatities: number;
}

export class CreateConstraintDTO {
  @ApiProperty()
  problemId: string;

  @ApiProperty({
    type: [Constraint],
    description: 'List of Constraint',
  })
  constraints: Constraint[];
}
