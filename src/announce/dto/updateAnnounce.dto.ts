import { ApiProperty } from '@nestjs/swagger';

export class UpdateAnnounceDTO {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;
}
