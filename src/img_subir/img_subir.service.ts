import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as https from 'https';
import FormData from 'form-data';

export interface ArchivoSubido {
  path: string;
}

@Injectable()
export class ImgSubirService {
  constructor(private readonly configService: ConfigService) {}

  async uploadImage(file?: ArchivoSubido): Promise<string> {
    if (!file?.path) {
      throw new InternalServerErrorException('No se ha proporcionado ningún archivo.');
    }

    const imgbbApiKey = this.configService.get<string>('IMGBB_API_KEY');
    if (!imgbbApiKey) {
      throw new InternalServerErrorException('Falta configurar IMGBB_API_KEY.');
    }

    const imagePath = file.path;
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const formData = new FormData();
    formData.append('image', base64Image);

    const options = {
      method: 'POST',
      hostname: 'api.imgbb.com',
      path: `/1/upload?key=${imgbbApiKey}`,
      headers: formData.getHeaders(),
    };

    return new Promise<string>((resolve, reject) => {
      const req = https.request(options, res => {
        let responseData = '';

        res.on('data', chunk => {
          responseData += chunk;
        });

        res.on('end', () => {
          this.eliminarTemporal(imagePath);
          try {
            const response = JSON.parse(responseData);
            if (response?.success) {
              resolve(response.data.url);
              return;
            }
            reject(
              new InternalServerErrorException(
                response?.data?.error?.message ?? 'No se pudo subir la imagen a imgbb.',
              ),
            );
          } catch {
            reject(new InternalServerErrorException('Respuesta inválida de imgbb.'));
          }
        });
      });

      req.on('error', error => {
        this.eliminarTemporal(imagePath);
        reject(new InternalServerErrorException(error.message));
      });

      formData.pipe(req);
    });
  }

  private eliminarTemporal(imagePath: string): void {
    try {
      fs.unlinkSync(imagePath);
    } catch {
      // Si el archivo temporal ya no existe, no es un error para el usuario.
    }
  }
}
