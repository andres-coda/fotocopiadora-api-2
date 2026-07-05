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
import { LibroPedidoModule } from './pedido_item/pedido_item.module';
import { EspecificacionModule } from './especificacion/especificacion.module';
import { Precio } from './precio/entity/precio.entity';
import { Materia } from './materia/entity/materia.entity';
import { Pedido } from './pedido/entity/pedido.entity';
import { Sede } from './sede/entity/sede.entity';
import { Cliente } from './cliente/entity/cliente.entity';
import { Especificacion } from './especificacion/entity/especificacion.entity';
import { PropuestaPedidoModule } from './propuesta_pedido/propuesta_pedido.module';
import { Propuesta } from './propuesta_pedido/entity/propuesta_pedido.entity';
import { ComponenteModule } from './componente/componente.module';
import { Componente } from './componente/entity/componente.entity';
import { DbContextInterceptor } from './common/interceptors/db-context.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PedidoItem } from './pedido_item/entity/pedido_item.entity';
import { ClienteResumen } from './cliente/entity/clienteResumen.entity';
import { LibroResumen } from './libro/entity/libro_resumen.entity';
import { Stock } from './libro/entity/stock.entity';

@Module({
   imports: [
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'client') }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'fotocopiadora',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      entities: [
        Cliente,
        ClienteResumen,
        Componente,
        Especificacion,
        Materia,
        Libro,
        LibroResumen,
        PedidoItem,
        Pedido,
        Precio,
        Propuesta,
        Sede,
        Stock,
        User,
      ],
      synchronize: false,
      logging: false,
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
    LibroPedidoModule,
    EspecificacionModule,
    PropuestaPedidoModule,
    ComponenteModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: DbContextInterceptor,
    }
  ],
})
export class AppModule {}
