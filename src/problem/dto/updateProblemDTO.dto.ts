import { ApiProperty } from '@nestjs/swagger';

export class UpdateProblemDTO {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  hint: string;

  @ApiProperty()
  revaleCode: string;

  @ApiProperty()
  isRegex: boolean;

  @ApiProperty()
  score: number;
}
