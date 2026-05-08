import { Controller } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { DtoLibroCrear } from './dto/libroCrear.dto';
import { DtoLibroEditar } from './dto/libroEditar.dto';
import { Libro } from './entity/libro.entity';
import { LibroService } from './libro.service';
import { Entidad } from '../gateway/dto/gatewayDto.dto';
import { LIBRO_RELATIONS, SELECTED_LIBRO, SELECTED_LIBROS_TODOS } from './default/relacion.default';
import { DtoLibroRespuesta } from './dto/libroRetorno.dto';

@Controller('libro')
export class LibroController extends BaseController<typeof Entidad.LIBRO, Libro, DtoLibroCrear, DtoLibroEditar, LibroService> {
  constructor(
    protected readonly libroService: LibroService,
  ) {
    super(libroService, Entidad.LIBRO, 'libro', [LIBRO_RELATIONS], 'nombre', SELECTED_LIBRO, undefined, SELECTED_LIBROS_TODOS)
  }
}
