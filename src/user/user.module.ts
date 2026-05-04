import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { AuthModule } from '../auth/auth.module';
import { ErroresModule } from '../error/error.module';
import { GateWayModule } from '../gateway/gateway.module';
import { UserController } from './user.controller';
import { MateriaModule } from '@src/materia/materia.module';
import { PrecioModule } from '@src/precio/precio.module';
import { EspecificacionModule } from '@src/especificacion/especificacion.module';
import { LibroModule } from '@src/libro/libro.module';
import { ComponenteModule } from '@src/componente/componente.module';
import { SedeModule } from '@src/sede/sede.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => ErroresModule),
    forwardRef(() => GateWayModule),
    forwardRef(() => MateriaModule),
    forwardRef(() => PrecioModule),
    forwardRef(() => EspecificacionModule),
    forwardRef(() => ComponenteModule),
    forwardRef(() => SedeModule),
    forwardRef(() => LibroModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule { }
