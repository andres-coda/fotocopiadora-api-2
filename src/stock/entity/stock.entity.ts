import { Base } from "../../base/entity/base.entity";
import { Libro } from "../../libro/entity/libro.entity";
import { Column, Entity, Index, JoinColumn, OneToOne } from "typeorm";
import { DtoStockEditar } from "../dto/stockEditar.dto";
import { Estado } from "../../interface/estado.interface";
import { NotFoundException } from "@nestjs/common";

@Entity('stock')
export class Stock extends Base {
  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Column({ type: 'int', default: 0 })
  pendiente!: number;

  @Column({ type: 'int', default: 0 })
  listo!: number;

  @Column({ type: 'int', default: 0 })
  retirado!: number;

  @Column({ type: 'int', default: 0 })
  cancelado!: number;

  @OneToOne(() => Libro, libro => libro.stock)
  @JoinColumn({ name: 'libro_id' })
  libro!: Libro;

  constructor() {
    super()
    this.stock = 0;
    this.pendiente = 0;
    this.listo = 0;
    this.retirado = 0;
    this.cancelado = 0;
  }
}