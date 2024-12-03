import { ApiProperty } from '@nestjs/swagger';

export class CreateReplyDTO {
  @ApiProperty()
  courseAnnounceId: string;

  @ApiProperty()
  message: string;
}
