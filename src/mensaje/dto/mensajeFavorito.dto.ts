import { IsBoolean } from 'class-validator';

export class DtoMensajeFavorito {
  @IsBoolean({ message: 'El favorito debe ser un booleano' })
  favorito!: boolean;
}
