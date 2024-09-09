import { ApiProperty } from '@nestjs/swagger';

export class UpdateSchoolDTO {
  @ApiProperty()
  schoolName: string;
}
