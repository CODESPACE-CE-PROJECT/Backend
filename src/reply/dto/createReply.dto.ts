import { ApiProperty } from '@nestjs/swagger';

export class CreateReplyDTO {
  @ApiProperty()
  message: string;

  @ApiProperty()
  courseAnnounceId: string;
}
