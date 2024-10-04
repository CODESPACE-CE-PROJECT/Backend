import { ApiProperty } from '@nestjs/swagger';
export class UpdateUserDTO {
  @ApiProperty()
  email: string;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  studentNo: string;
  @ApiProperty()
  gender: string;
}
