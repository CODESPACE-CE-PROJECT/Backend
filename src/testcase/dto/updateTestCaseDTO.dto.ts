import { ApiProperty } from '@nestjs/swagger';
import { TestCase } from './createTestCaseDTO.dto';

export class UpdateTestCaseDTO {
  @ApiProperty({
    type: [TestCase],
    description: 'List of TestCase',
  })
  testCases: TestCase[];
}
