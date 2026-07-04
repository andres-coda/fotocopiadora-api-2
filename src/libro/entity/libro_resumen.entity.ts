import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Libro } from "./libro.entity";

/**
 * Tabla resumen_cliente — mantenida exclusivamente por triggers de PostgreSQL.
 *
 * Cambios críticos respecto a la versión anterior:
 * - NO extiende Base: la PK es id_cliente (uuid), no tiene fechas propias
 *   ni deleted. La BD tiene un trigger fc_prohibir_modificacion que lanza
 *   excepción si se intenta escribir directamente.
 * - Esta entity es de SOLO LECTURA desde la API.
 *   Nunca hacer save/insert/update sobre ella desde TypeORM.
 * - Los contadores (pendiente, listo, retirado, cancelado) se actualizan
 *   automáticamente cuando cambia el estado de un pedido.
 */

@Entity('resumen_libro')
export class LibroResumen{
  @PrimaryColumn({ type: 'uuid', name: 'id_libro' })
  idLibro!: string;

  @PrimaryColumn({ type: 'uuid', name: 'id_empresa' })
  idEmpresa!: string;

  @Column({ type: 'int', default: 0 })
  pendiente!: number;

  @Column({ type: 'int', default: 0 })
  listo!: number;

  @Column({ type: 'int', default: 0 })
  retirado!: number;

  @Column({ type: 'int', default: 0 })
  cancelado!: number;

  @OneToOne(() => Libro)
  @JoinColumn({ name: 'id_libro' })
  Libro!: Libro;

  constructor() {
    this.pendiente = 0;
    this.listo = 0;
    this.retirado = 0;
    this.cancelado = 0;
  }
}

