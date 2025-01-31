import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { MinioClientModule } from 'src/minio-client/minio-client.module';

@Module({
  imports: [MinioClientModule],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
