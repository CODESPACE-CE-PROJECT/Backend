import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDTO {
  @ApiProperty()
  password: string;

  @ApiProperty()
  confirmPassword: string;
}
