import { Base } from "../../base/entity/base.entity";
import { Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryColumn } from "typeorm";
import { Libro } from "../../libro/entity/libro.entity";
import { Pedido } from "../../pedido/entity/pedido.entity";
import { Especificacion } from "../../especificacion/entity/especificacion.entity";
import { Estado } from "../../interface/estado.interface";
import { Sede } from "../../sede/entity/sede.entity";
import { EstadoPedido } from "@src/pedido/interface/estadoPedido.enum";

/**
 * Tabla pedido_item — ítem individual de un pedido.
 *
 * Cambios críticos respecto a LibroPedido:
 * - PK compuesta (id_pedido, id) en lugar de UUID simple
 *   → NO extiende Base, tiene sus propias columnas primarias
 * - La relación ManyToMany con Especificacion desaparece:
 *   ahora es la tabla pedido_item_especificacion manejada por la BD
 *   y consultable via vw_especificaciones
 * - id_libro referencia a libro_empresa (id_empresa + id_libro),
 *   simplificado acá como FK al uuid del libro
 * - estado: tinyint → integer (1-7)
 * - El estado del pedido padre lo recalcula automáticamente
 *   el trigger fc_actualizar_estado_pedido
 * - resumen_libro lo actualiza automáticamente fc_actualizar_resumen
 */

@Entity('pedido_item')
export class PedidoItem{
  @PrimaryColumn({ type: 'uuid', name: 'id_pedido' })
  idPedido!: string;

  @PrimaryColumn({ type: 'int', name: 'id' })
  id!: number;

  @Column({ type: 'int' })
  cantidad!: number;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  detalles?: string;

  @Column({ type: 'int', default: EstadoPedido.PENDIENTE })
  estado!: EstadoPedido;

  @Column({ type: 'uuid', name: 'id_libro' })
  idLibro!: string;

  @Column({ type: 'uuid', name: 'id_sede' })
  idSede!: string;

  @Column({ type: 'uuid', name: 'id_empresa' })
  idEmpresa!: string;

  @Index()
  @ManyToOne(() => Pedido, (pedido) => pedido.pedidoItems, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_pedido' })
  pedido!: Pedido;

  @ManyToOne(() => Sede, { nullable: false })
  @JoinColumn({ name: 'id_sede' })
  sede!: Sede;

  constructor() {
    this.estado = EstadoPedido.PENDIENTE;
  }
}