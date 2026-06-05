import { forwardRef, Module } from '@nestjs/common';
import { LibroPedidoController } from './libro_pedido.controller';
import { LibroPedidoService } from './libro_pedido.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { LibroPedido } from './entity/libroPedido.entity';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { ErroresModule } from '../error/error.module';
import { GateWayModule } from '../gateway/gateway.module';
import { Pedido } from '../pedido/entity/pedido.entity';
import { StockModule } from '../stock/stock.module';
import { EspecificacionModule } from '../especificacion/especificacion.module';
import { LibroModule } from '../libro/libro.module';
import { PedidoModule } from '../pedido/pedido.module';
import { SedeModule } from '../sede/sede.module';
import { Libro } from '../libro/entity/libro.entity';
import { Sede } from '../sede/entity/sede.entity';
import { Especificacion } from '../especificacion/entity/especificacion.entity';
import { ClienteResumenModule } from '@src/cliente_resumen/cliente_resumen.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Libro,
      LibroPedido,
      Pedido,
      Sede,
      Especificacion,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => ErroresModule),
    forwardRef(() => GateWayModule),
    forwardRef(() => EspecificacionModule),
    forwardRef(() => LibroModule),
    forwardRef(() => PedidoModule),
    forwardRef(() => SedeModule),
    forwardRef(() => StockModule),
    forwardRef(() => ClienteResumenModule),
  ],
  controllers: [LibroPedidoController],
  providers: [LibroPedidoService],
  exports: [LibroPedidoService]
})
export class LibroPedidoModule { }
