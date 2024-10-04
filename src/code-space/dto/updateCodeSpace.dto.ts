import { ApiProperty } from '@nestjs/swagger';

export class UpdateCodeSpaceDTO {
  @ApiProperty()
  language: string;

  @ApiProperty()
  sourceCode: string;

  @ApiProperty()
  filename: string;
}
