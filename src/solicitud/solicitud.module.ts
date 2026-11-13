import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Solicitud } from './entity/solicitud.entity';
import { Peticion } from './entity/peticion.entity';
import { SolicitudController } from './solicitud.controller';
import { SolicitudService } from './solicitud.service';
import { AuthModule } from '../auth/auth.module';
import { ErroresModule } from '../error/error.module';
import { GateWayModule } from '../gateway/gateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Solicitud, Peticion]),
    AuthModule,
    ErroresModule,
    forwardRef(() => GateWayModule),
  ],
  controllers: [SolicitudController],
  providers: [SolicitudService],
  exports: [SolicitudService],
})
export class SolicitudModule { }