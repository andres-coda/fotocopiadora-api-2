import { Base } from "../../base/entity/base.entity";
import { Libro } from "../../libro/entity/libro.entity";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
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

  verificarStock(dto: DtoStockEditar): Stock {
    console.log('Dto stock',dto);
    switch (dto.anterior) {
      case Estado.STOCK:
        console.log('Entre anterior: ',Estado.STOCK);
        if (this.stock - dto.cantidad <= 0) {
          this.stock = 0;
          break;
        }
        this.stock = this.stock - dto.cantidad;
        break;
      case Estado.PENDIENTE, Estado.IMPRESO_COMPLETO, Estado.IMPRESO_MITAD:
        console.log('Entre anterior: ',Estado.PENDIENTE);
        if (this.pendiente - dto.cantidad <= 0) {
          this.pendiente = 0;
          break;
        }
        this.pendiente = this.pendiente - dto.cantidad;
        break;
      case Estado.LISTO:
        console.log('Entre anterior: ',Estado.LISTO);
        if (this.listo - dto.cantidad <= 0) {
          this.listo = 0;
          break;
        }
        this.listo = this.listo - dto.cantidad;
        break;
      case Estado.RETIRADO:
        console.log('Entre anterior: ',Estado.RETIRADO);
        if (this.retirado - dto.cantidad <= 0) {
          this.retirado = 0;
          break;
        }
        this.retirado = this.retirado - dto.cantidad;
        break;
      case Estado.CANCELADO:
        console.log('Entre anterior: ',Estado.CANCELADO);        
        if (this.cancelado - dto.cantidad <= 0) {
          this.cancelado = 0;
          break;
        }
        if (dto.actual === Estado.STOCK) break;
        this.cancelado = this.cancelado - dto.cantidad;
        break;
      default: break;
    }

    switch (dto.actual) {
      case Estado.PENDIENTE: 
      case Estado.IMPRESO_COMPLETO:
      case Estado.IMPRESO_MITAD:
        console.log('Entre actual: ',Estado.PENDIENTE);
        this.pendiente += dto.cantidad;
        break;
      case Estado.LISTO:
        console.log('Entre actual: ',Estado.LISTO);
        this.listo += dto.cantidad;
        break;
      case Estado.RETIRADO:
        console.log('Entre actual: ',Estado.RETIRADO);
        this.retirado += dto.cantidad;
        break;
      case Estado.CANCELADO:
        console.log('Entre actual: ',Estado.CANCELADO);
        this.cancelado += dto.cantidad;
        break
      case Estado.STOCK:
        console.log('Entre actual: ',Estado.STOCK);
        this.stock += dto.cantidad;
        break;
      default: 
        throw new NotFoundException('No esta desarrollado ese estado');
    }
    return this;
  }
}
