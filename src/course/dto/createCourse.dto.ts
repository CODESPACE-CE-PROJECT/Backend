import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDTO {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  picture: Express.Multer.File;
}
