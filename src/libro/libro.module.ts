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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Libro,
      Materia,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => ErroresModule),
    forwardRef(() => GateWayModule),
    forwardRef(() => MateriaModule),
  ],
  controllers: [LibroController],
  providers: [LibroService],
  exports: [LibroService]
})
export class LibroModule { }
