import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidoItem } from './entity/pedido_item.entity';
import { AuthModule } from '../auth/auth.module';
import { ErroresModule } from '../error/error.module';
import { GateWayModule } from '../gateway/gateway.module';
import { Pedido } from '../pedido/entity/pedido.entity';
import { EspecificacionModule } from '../especificacion/especificacion.module';
import { LibroModule } from '../libro/libro.module';
import { PedidoModule } from '../pedido/pedido.module';
import { Libro } from '../libro/entity/libro.entity';
import { Sede } from '../sede/entity/sede.entity';
import { Especificacion } from '../especificacion/entity/especificacion.entity';
import { PedidoItemController } from './pedido_item.controller';
import { PedidoItemService } from './pedido_item.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Libro,
      PedidoItem,
      Pedido,
      Sede,
      Especificacion,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => ErroresModule),
    forwardRef(() => GateWayModule),
    forwardRef(() => EspecificacionModule),
    forwardRef(() => LibroModule),
    forwardRef(() => PedidoModule),
  ],
  controllers: [PedidoItemController],
  providers: [PedidoItemService],
  exports: [PedidoItemService]
})
export class LibroPedidoModule { }
