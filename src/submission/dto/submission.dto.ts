import { ApiProperty } from '@nestjs/swagger';

export class SubmissionDTO {
  @ApiProperty()
  problemId: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  sourceCode: string;

  @ApiProperty()
  result: string;

  @ApiProperty()
  status: boolean;
}
