import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
export class UpdateUserDTO {
  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  studentNo: string;

  @ApiProperty({ enum: ['MALE', 'FEMALE', 'OTHER'] })
  gender: Gender;

  @ApiProperty({ type: 'string', format: 'binary' })
  picture: Express.Multer.File;

  @ApiProperty()
  allowLogin: boolean;

  @ApiProperty()
  isEnable: boolean;
}
