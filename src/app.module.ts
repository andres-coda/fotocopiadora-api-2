import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { User } from './user/entity/user.entity';
import { GateWayModule } from './gateway/gateway.module';
import { ErroresModule } from './error/error.module';
import { LibroModule } from './libro/libro.module';
import { Libro } from './libro/entity/libro.entity';
import { PrecioModule } from './precio/precio.module';
import { MateriaModule } from './materia/materia.module';
import { PedidoModule } from './pedido/pedido.module';
import { SedeModule } from './sede/sede.module';
import { ClienteModule } from './cliente/cliente.module';
import { StockModule } from './stock/stock.module';
import { LibroPedidoModule } from './libro_pedido/libro_pedido.module';
import { EspecificacionModule } from './especificacion/especificacion.module';
import { Precio } from './precio/entity/precio.entity';
import { Materia } from './materia/entity/materia.entity';
import { Pedido } from './pedido/entity/pedido.entity';
import { Sede } from './sede/entity/sede.entity';
import { Cliente } from './cliente/entity/cliente.entity';
import { Stock } from './stock/entity/stock.entity';
import { LibroPedido } from './libro_pedido/entity/libroPedido.entity';
import { Especificacion } from './especificacion/entity/especificacion.entity';
import { PropuestaPedidoModule } from './propuesta_pedido/propuesta_pedido.module';
import { ClienteResumenModule } from './cliente_resumen/cliente_resumen.module';
import { Propuesta } from './propuesta_pedido/entity/propuesta_pedido.entity';
import { ClienteResumen } from './cliente_resumen/entity/clienteResumen.entity';
import { ComponenteModule } from './componente/componente.module';
import { Componente } from './componente/entity/componente.entity';

@Module({
  imports: [
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'client') }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'fotocopiadora2',
      ssl: false,
      entities: [
        Cliente,
        ClienteResumen,
        Componente,
        Especificacion,
        Materia,
        Libro,
        LibroPedido,
        Pedido,
        Precio,
        Propuesta,
        Sede,
        Stock,
        User,
      ],
      migrations: [__dirname + '/dataBase/migrations/*{.ts,.js}'],
      migrationsRun: true,
      synchronize: false,
      logging: true,
    }),
    ErroresModule,
    GateWayModule,
    UserModule,
    LibroModule,
    PrecioModule,
    MateriaModule,
    PedidoModule,
    SedeModule,
    ClienteModule,
    StockModule,
    LibroPedidoModule,
    EspecificacionModule,
    PropuestaPedidoModule,
    ClienteResumenModule,
    ComponenteModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
