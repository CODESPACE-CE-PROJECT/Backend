import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SchoolModule } from './school/school.module';
import { MinioClientModule } from './minio-client/minio-client.module';
import { InitModule } from './init/init.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UserModule,
    AuthModule,
    SchoolModule,
    MinioClientModule,
    InitModule,
  ],
})
export class AppModule {}
