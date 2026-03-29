import { forwardRef, Module } from '@nestjs/common';
import { MateriaController } from './materia.controller';
import { MateriaService } from './materia.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@src/user/entity/user.entity';
import { Libro } from '@src/libro/entity/libro.entity';
import { AuthModule } from '@src/auth/auth.module';
import { UserModule } from '@src/user/user.module';
import { ErroresModule } from '@src/error/error.module';
import { GateWayModule } from '@src/gateway/gateway.module';
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
