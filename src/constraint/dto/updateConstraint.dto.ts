import { ApiProperty } from '@nestjs/swagger';
import { Constraint } from './createConstraint.dto';

export class UpdateConstraintDTO {
  @ApiProperty({
    type: [Constraint],
    description: 'List of Constraint',
  })
  constraints: Constraint[];
}
