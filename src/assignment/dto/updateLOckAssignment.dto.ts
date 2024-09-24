import { ApiProperty } from '@nestjs/swagger';

export class UpdateLockAssignmentDTO {
  @ApiProperty()
  isLock: boolean;
}
