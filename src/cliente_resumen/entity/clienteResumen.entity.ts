import { Base } from "../../base/entity/base.entity";
import { Column, Entity, Index, JoinColumn, OneToOne } from "typeorm";
import { Estado } from "../../interface/estado.interface";
import { NotFoundException } from "@nestjs/common";
import { Cliente } from "../../cliente/entity/cliente.entity";
import { DtoResumenEditar } from "../dto/clienteResumenEditar.dto";

@Entity('cliente_resumen')
export class ClienteResumen extends Base {
  @Column({ type: 'int', default: 0 })
  pendiente!: number;

  @Column({ type: 'int', default: 0 })
  listo!: number;

  @Column({ type: 'int', default: 0 })
  retirado!: number;

  @Column({ type: 'int', default: 0 })
  cancelado!: number;

  @OneToOne(() => Cliente, cliente => cliente.resumen)
  @JoinColumn({ name: 'cliente_id' })
  cliente!: Cliente;

  constructor() {
    super()
    this.pendiente = 0;
    this.listo = 0;
    this.retirado = 0;
    this.cancelado = 0;
  }
}