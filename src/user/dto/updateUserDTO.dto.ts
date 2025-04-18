import { ApiProperty } from '@nestjs/swagger';
import { Gender, Role } from '@prisma/client';
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
  picture: Express.Multer.File | null;

  @ApiProperty()
  allowLogin: boolean;

  @ApiProperty()
  isEnable: boolean;

  role: Role;
}
