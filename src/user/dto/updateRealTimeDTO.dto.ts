import { ApiProperty } from '@nestjs/swagger';

export class UpdateRealTimeDTO {
  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  ipAddress: string;
}
