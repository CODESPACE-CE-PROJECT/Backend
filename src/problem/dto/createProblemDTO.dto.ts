import { ApiProperty } from '@nestjs/swagger';
import { ConstraintType, LanguageType } from '@prisma/client';

class TestCase {
  @ApiProperty()
  input: string;

  @ApiProperty()
  output: string;

  @ApiProperty()
  isHidden: boolean;
}

class Constraint {
  @ApiProperty({ enum: ['FUNCTION', 'METHOD', 'CLASS'] })
  type: ConstraintType;

  @ApiProperty()
  keyword: string;

  @ApiProperty()
  quantities: number;
}

export class CreateProblemDTO {
  @ApiProperty()
  assignmentId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  hint: string;

  @ApiProperty({ enum: ['C', 'CPP', 'JAVA', 'PYTHON'] })
  language: LanguageType;

  @ApiProperty()
  revaleCode: string;

  @ApiProperty()
  isRegex: boolean;

  @ApiProperty()
  score: number;

  @ApiProperty({ type: TestCase, isArray: true })
  testcase: TestCase[];

  @ApiProperty({ type: Constraint, isArray: true })
  constraint: Constraint[];
}
