import { ApiProperty } from '@nestjs/swagger';
import { LanguageType } from '@prisma/client';

export class CreateAssigmentDTO {
  @ApiProperty()
  courseId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  language: LanguageType;

  @ApiProperty()
  problemQuantities: number;
}
