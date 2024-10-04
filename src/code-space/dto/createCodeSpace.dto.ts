import { ApiProperty } from '@nestjs/swagger';

export class CreateCodeSpaceDTO {
  @ApiProperty()
  language: string;

  @ApiProperty()
  sourceCode: string;

  @ApiProperty()
  filename: string;
}
