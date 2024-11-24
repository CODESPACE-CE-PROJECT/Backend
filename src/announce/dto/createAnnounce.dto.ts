import { ApiProperty } from '@nestjs/swagger';

export class CreateAnnounceDTO {
  @ApiProperty()
  courseId: string;

  @ApiProperty()
  description: string;
}
