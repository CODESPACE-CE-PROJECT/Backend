import { ApiProperty } from '@nestjs/swagger';

export class AddUserToCourseDTO {
  @ApiProperty()
  courseId: string;

  @ApiProperty()
  users: string[];
}
