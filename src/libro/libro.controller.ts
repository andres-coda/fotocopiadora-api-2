import { Controller } from '@nestjs/common';
import { BaseController } from '@src/base/base.controller';
import { DtoLibroCrear } from './dto/libroCrear.dto';
import { DtoLibroEditar } from './dto/libroEditar.dto';
import { Libro } from './entity/libro.entity';
import { LibroService } from './libro.service';
import { Entidad } from '@src/gateway/dto/gatewayDto.dto';
import { LIBRO_RELATIONS, SELECTED_LIBRO } from './default/relacion.default';

@Controller('libro')
export class LibroController extends BaseController<typeof Entidad.LIBRO, Libro, DtoLibroCrear, DtoLibroEditar> {
  constructor(
    protected readonly libroService: LibroService,
  ) {
    super(libroService, Entidad.LIBRO, 'libro', [LIBRO_RELATIONS], 'nombre', SELECTED_LIBRO)
  }
}
