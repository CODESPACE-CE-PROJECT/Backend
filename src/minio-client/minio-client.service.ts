import { Injectable, Logger } from '@nestjs/common';
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

  async uploadFile(
    minioBucket: string,
    file: Express.Multer.File,
    pictureUrl: string | null,
  ) {
    try {
      if (!file) {
        return { fileUrl: '' };
      }

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
      const splitData = pictureUrl?.split('/');
      if (pictureUrl && splitData) {
        await this.deleteFile(minioBucket, splitData[4]);
      }
      this.minio.client.putObject(minioBucket, fileName, fileBuffer);
      const prefixrUrl = `${this.configService.get('NODE_ENV') === 'production' ? 'https' : 'http'}://${this.configService.get('MINIO_URL')}${this.configService.get('NODE_ENV') === 'production' ? '' : `:${this.configService.get('MINIO_PORT')}`}`;
      return {
        fileUrl: `${prefixrUrl}/${minioBucket}/${fileName}`,
      };
    } catch (error) {
      throw new Error(error);
    }
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

  async deleteFile(bucketName: string, objectName: string) {
    await this.minio.client.removeObject(bucketName, objectName);
  }
}
