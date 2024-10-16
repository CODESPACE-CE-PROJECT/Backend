import { ApiProperty } from '@nestjs/swagger';
import { InputJsonValue } from '@prisma/client/runtime/library';

class result {
  @ApiProperty()
  output: string;

  @ApiProperty()
  isPass: boolean;
}

export class SubmissionDTO {
  @ApiProperty()
  problemId: string;

  @ApiProperty()
  sourceCode: string;

  @ApiProperty({
    type: [result],
  })
  results: result[] | InputJsonValue;

  @ApiProperty()
  status: boolean;
}
