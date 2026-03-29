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
        Libro,
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
    StockModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
