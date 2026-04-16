import { forwardRef, Module } from '@nestjs/common';
import { MateriaController } from './materia.controller';
import { MateriaService } from './materia.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { Libro } from '../libro/entity/libro.entity';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { ErroresModule } from '../error/error.module';
import { GateWayModule } from '../gateway/gateway.module';
import { Materia } from './entity/materia.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Libro,
      Materia
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => ErroresModule),
    forwardRef(() => GateWayModule),
  ],
  controllers: [MateriaController],
  providers: [MateriaService],
  exports: [MateriaService]
})
export class MateriaModule { }
