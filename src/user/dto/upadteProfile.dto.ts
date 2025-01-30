import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
export class UpdateProfileDTO {
  @ApiPropertyOptional()
  email: string;

  @ApiPropertyOptional()
  firstName: string;

  @ApiPropertyOptional()
  lastName: string;

  @ApiPropertyOptional()
  studentNo: string;

  @ApiPropertyOptional({ enum: ['MALE', 'FEMALE', 'OTHER'] })
  gender: Gender;

  @ApiProperty({ type: 'string', format: 'binary' })
  picture: Express.Multer.File | null;
}
