import { ApiProperty } from '@nestjs/swagger';

export class UpdateAnnounceDTO {
  @ApiProperty()
  description: string;
}
