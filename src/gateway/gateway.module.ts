import { Module, forwardRef } from '@nestjs/common';
import { GatewayGateway } from './gateway.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [GatewayGateway],
  exports: [GatewayGateway]
})
export class GateWayModule {}
