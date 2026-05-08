import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { AuthModule } from '../auth/auth.module';
import { ErroresModule } from '../error/error.module';
import { GateWayModule } from '../gateway/gateway.module';
import { UserController } from './user.controller';
import { MateriaModule } from '../materia/materia.module';
import { PrecioModule } from '../precio/precio.module';
import { EspecificacionModule } from '../especificacion/especificacion.module';
import { LibroModule } from '../libro/libro.module';
import { ComponenteModule } from '../componente/componente.module';
import { SedeModule } from '../sede/sede.module';

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
