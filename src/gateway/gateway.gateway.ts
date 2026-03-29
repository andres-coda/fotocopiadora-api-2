import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import {Server, Socket} from 'socket.io'
import { Mensaje } from './dto/gatewayDto.dto';

@WebSocketGateway()
export class GatewayGateway implements OnGatewayConnection, OnGatewayDisconnect{
  @WebSocketServer()
  server!: Server;

  handleConnection(cliente: Socket){
    console.log(`Cliente conectado: ${cliente.id}`);    
  }

  handleDisconnect(cliente: Socket){
    console.log(`Cliente desconectado: ${cliente.id}`);
  }

  actualizacionDato(mensaje:Mensaje){
    this.server.emit(mensaje.mensaje, mensaje);
  }

}
