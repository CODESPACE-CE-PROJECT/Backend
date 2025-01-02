import { ApiProperty } from '@nestjs/swagger';
import { Gender, Role } from '@prisma/client';

class Users {
  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  studentNo: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ enum: ['MALE', 'FEMALE', 'OTHER'] })
  gender: Gender;

  @ApiProperty({ enum: ['TEACHER', 'STUDENT'] })
  role: Role;
}

export class CreateUserDTO {
  @ApiProperty()
  schoolId: string;

  @ApiProperty({ type: Users, isArray: true })
  users: Users[];
}
