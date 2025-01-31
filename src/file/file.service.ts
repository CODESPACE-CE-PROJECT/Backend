import { Injectable } from '@nestjs/common';
import { MinioClientService } from 'src/minio-client/minio-client.service';

@Injectable()
export class FileService {
  constructor(private readonly minio: MinioClientService) {}

  async uploadFile(file: Express.Multer.File, bucketName: string) {
    try {
      const fileUrl = await this.minio.uploadFile(bucketName, file, '');
      return fileUrl;
    } catch (error) {
      console.log(error);
      throw new Error('Error Upload File');
    }
  }
}
