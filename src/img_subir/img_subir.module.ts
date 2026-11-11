import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@src/auth/auth.module';
import { ImgSubirController } from './img_subir.controller';
import { ImgSubirService } from './img_subir.service';

@Module({
  imports: [ConfigModule, forwardRef(() => AuthModule)],
  controllers: [ImgSubirController],
  providers: [ImgSubirService],
})
export class ImgSubirModule {}
