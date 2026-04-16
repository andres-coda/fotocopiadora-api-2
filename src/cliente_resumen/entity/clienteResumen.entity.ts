import { Base } from "../../base/entity/base.entity";
import { Column, Entity, OneToOne } from "typeorm";
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

  @OneToOne(() => Cliente, cliente => cliente.resumen)
  cliente!: Cliente;

  constructor() {
    super()
    this.pendiente = 0;
    this.listo = 0;
    this.retirado = 0;
  }

  verificarResumen(dto: DtoResumenEditar): ClienteResumen {
    switch (dto.anterior) {
      case Estado.PENDIENTE:
      case Estado.IMPRESO_COMPLETO:
      case Estado.IMPRESO_MITAD:
        if (this.pendiente < 1) {
          this.pendiente = 0;
          break;
        }
        this.pendiente = this.pendiente - 1;
        break;
      case Estado.LISTO:
        if (this.listo < 1) {
          this.listo = 0;
          break;
        }
        this.listo = this.listo - 1;
        break;
      case Estado.RETIRADO:
      case Estado.CANCELADO:
        if (this.retirado < 1) {
          this.retirado = 0;
          break;
        }
        this.retirado = this.retirado - 1;
        break;
      default: throw new NotFoundException('No esta desarrollado ese estado');
    }

    switch (dto.actual) {
      case Estado.PENDIENTE:
      case Estado.IMPRESO_COMPLETO:
      case Estado.IMPRESO_MITAD:
        this.pendiente += 1;
        break;
      case Estado.LISTO:
        this.listo += 1;
        break;
      case Estado.RETIRADO:
      case Estado.CANCELADO:
        this.retirado += 1;
        break;
      default: throw new NotFoundException('No esta desarrollado ese estado');
    }
    return this;
  }
}

