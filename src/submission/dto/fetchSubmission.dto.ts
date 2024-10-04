import { ApiProperty } from '@nestjs/swagger';

export class FetchSubmissionDTO {
  @ApiProperty()
  username: string;

  @ApiProperty()
  problemId: string;
}
