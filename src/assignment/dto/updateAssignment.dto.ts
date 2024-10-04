import { ApiProperty } from '@nestjs/swagger';
import { LanguageType } from '@prisma/client';

export class UpdateAssignmentDTO {
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
