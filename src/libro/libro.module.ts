import { forwardRef, Module } from '@nestjs/common';
import { LibroController } from './libro.controller';
import { LibroService } from './libro.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@src/user/entity/user.entity';
import { AuthModule } from '@src/auth/auth.module';
import { UserModule } from '@src/user/user.module';
import { ErroresModule } from '@src/error/error.module';
import { GateWayModule } from '@src/gateway/gateway.module';
import { Materia } from '@src/materia/entity/materia.entity';
import { MateriaModule } from '@src/materia/materia.module';
import { Libro } from './entity/libro.entity';
import { LibroPedido } from '@src/libro_pedido/entity/libroPedido.entity';
import { Stock } from '@src/stock/entity/stock.entity';
import { StockService } from '@src/stock/stock.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Libro,
      LibroPedido,
      Materia,
      Stock,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => ErroresModule),
    forwardRef(() => GateWayModule),
    forwardRef(() => MateriaModule),
    forwardRef(() => StockService),
  ],
  controllers: [LibroController],
  providers: [LibroService],
  exports: [LibroService]
})
export class LibroModule { }
