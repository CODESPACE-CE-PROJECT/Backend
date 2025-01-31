import { ApiProperty } from '@nestjs/swagger';

export class uploadFileDTO {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File;
}
