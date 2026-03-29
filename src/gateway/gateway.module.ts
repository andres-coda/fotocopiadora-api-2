import { Module } from '@nestjs/common';
import { GatewayGateway } from './gateway.gateway';

@Module({
  providers: [GatewayGateway],
  exports: [GatewayGateway]
})
export class GateWayModule {}
