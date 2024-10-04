import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioClientService {
  private readonly logger: Logger;
  constructor(
    private readonly minio: MinioService,
    private readonly configService: ConfigService,
  ) {
    this.logger = new Logger('MinioStorageService');
  }

  async uploadImage(file: Express.Multer.File) {
    if (!(file.mimetype.includes('jpeg') || file.mimetype.includes('png'))) {
      throw new HttpException(
        'Error Upload Image To MinIO',
        HttpStatus.BAD_REQUEST,
      );
    }
    const minioBucket = this.configService.get('MINIO_BUCKET') as string;
    const temp_file = Date.now().toString();
    const hashFileName = crypto
      .createHash('sha512')
      .update(temp_file)
      .digest('hex');
    const ext = file.originalname.substring(
      file.originalname.lastIndexOf('.'),
      file.originalname.length,
    );

    const fileName = hashFileName + ext;
    const fileBuffer = file.buffer;
    await this.ensureBucket(minioBucket);
    this.minio.client.putObject(minioBucket, fileName, fileBuffer);
    const imageUrl = this.getFileUrl(minioBucket, fileName);
    return {
      imageUrl: imageUrl,
      objectName: fileName,
    };
  }

  async getFileUrl(bucketName: string, objectName: string) {
    return this.minio.client.presignedGetObject(bucketName, objectName);
  }

  async ensureBucket(bucketName: string) {
    const exist = await this.minio.client.bucketExists(bucketName);
    if (!exist) {
      await this.minio.client.makeBucket(bucketName);
    }
  }
}
