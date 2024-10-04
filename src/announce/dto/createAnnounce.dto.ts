import { ApiProperty } from '@nestjs/swagger';

export class CreateAnnounceDTO {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  courseId: string;
}
