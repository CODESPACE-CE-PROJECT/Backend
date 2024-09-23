import { ApiProperty } from '@nestjs/swagger';

export class UpdateReplyDTO {
  @ApiProperty()
  message: string;
}
