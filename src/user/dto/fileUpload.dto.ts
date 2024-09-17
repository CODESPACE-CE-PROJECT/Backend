import { ApiProperty } from '@nestjs/swagger';
import { File } from 'buffer';

export class FileUploadDTO {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: File;
}
