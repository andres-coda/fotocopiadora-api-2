import { forwardRef, Module } from '@nestjs/common';
import { LibroController } from './libro.controller';
import { LibroService } from './libro.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { ErroresModule } from '../error/error.module';
import { GateWayModule } from '../gateway/gateway.module';
import { Materia } from '../materia/entity/materia.entity';
import { MateriaModule } from '../materia/materia.module';
import { Libro } from './entity/libro.entity';
import { LibroPedido } from '../libro_pedido/entity/libroPedido.entity';
import { Stock } from '../stock/entity/stock.entity';
import { StockService } from '../stock/stock.service';
import { StockModule } from '../stock/stock.module';
import { Componente } from '../componente/entity/componente.entity';
import { ComponenteModule } from '../componente/componente.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Libro,
      LibroPedido,
      Materia,
      Stock,
      Componente,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => ErroresModule),
    forwardRef(() => GateWayModule),
    forwardRef(() => MateriaModule),
    forwardRef(() => StockModule),
    forwardRef(() => ComponenteModule),
  ],
  controllers: [LibroController],
  providers: [LibroService],
  exports: [LibroService]
})
export class LibroModule { }
