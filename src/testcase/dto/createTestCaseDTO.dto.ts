import { ApiProperty } from '@nestjs/swagger';

export class TestCase {
  @ApiProperty()
  input: string;

  @ApiProperty()
  output: string;

  @ApiProperty()
  isHidden: boolean;
}

export class CreateTestCaseDTO {
  @ApiProperty()
  problemId: string;
  @ApiProperty({
    type: [TestCase],
    description: 'List of TestCase',
  })
  testCases: TestCase[];
}
