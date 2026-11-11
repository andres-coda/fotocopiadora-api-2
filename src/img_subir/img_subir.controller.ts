import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminGuard } from '@src/auth/guard/admin.guard';
import { ImgSubirService } from './img_subir.service';
import type { ArchivoSubido } from './img_subir.service';

@Controller('img-subir')
export class ImgSubirController {
  constructor(private readonly imgSubirService: ImgSubirService) {}

  @Post()
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('image', { dest: './uploads' }))
  async uploadFile(@UploadedFile() file: ArchivoSubido) {
    const imageUrl = await this.imgSubirService.uploadImage(file);
    return { imageUrl };
  }
}
