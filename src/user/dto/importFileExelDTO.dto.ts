import { ApiProperty } from '@nestjs/swagger';
import { File } from 'buffer';

export class importFileExelDTO {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: File;
}
