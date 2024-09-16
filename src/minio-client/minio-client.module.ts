import { Global, Module } from '@nestjs/common';
import { MinioClientService } from './minio-client.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MinioModule } from 'nestjs-minio-client';

@Global()
@Module({
  imports: [
    MinioModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        endPoint: configService.get('MINIO_ENDPOINT') as string,
        port: parseInt(configService.get('MINIO_PORT') as string, 10),
        useSSL: (configService.get('MINIO_USR_SSL') as string) === 'true',
        accessKey: configService.get('MINIO_ACCESSKEY') as string,
        secretKey: configService.get('MINIO_SECRETKEY') as string,
      }),
    }),
  ],
  providers: [MinioClientService],
  exports: [MinioClientService],
})
export class MinioClientModule {}
