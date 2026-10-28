import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Sede } from "@src/sede/entity/sede.entity";
import { DatoCobro } from "@src/dato_cobro/entity/datoCobro.entity";
import { Mensaje } from "@src/mensaje/entity/mensaje.entity";

/**
 * Tabla configuraciones — configuracion de una empresa (una fila por empresa).
 *
 * No extiende Base porque la tabla configuraciones:
 * - No tiene columna id: su PK es id_empresa.
 * - No tiene deleted ni fecha_creacion (solo fecha_actualizacion).
 * La fila la crea el trigger tr_empresa_config_insert al insertar una empresa.
 * El service filtra explicitamente por id_empresa; el RLS es la segunda capa.
 */
@Entity('configuraciones')
export class Configuracion {

  @PrimaryColumn({ type: 'uuid', name: 'id_empresa' })
  idEmpresa!: string;

  @Column({ type: 'timestamp', name: 'fecha_actualizacion' })
  fechaActualizacion!: Date;

  @Column({ type: 'date', name: 'fecha_entrega', nullable: true })
  fechaEntrega?: string;

  @Column({ type: 'smallint', name: 'hora_entrega', nullable: true })
  horaEntrega?: number;

  @Column({ type: 'boolean', name: 'msj_retiro', default: false, nullable: true })
  msjRetiro?: boolean;

  @Column({ type: 'boolean', name: 'msj_envio', default: false, nullable: true })
  msjEnvio?: boolean;

  /**
   * Relaciones de solo lectura usadas para resolver los nombres en GET /empresa/mia.
   * No se mapea una relacion a Empresa: la vista ya trae la empresa por separado.
   * Las columnas de join reusan las columnas uuid ya declaradas arriba.
   */
  @ManyToOne(() => Sede, { nullable: true })
  @JoinColumn({ name: 'id_sede' })
  sede?: Sede;

  @ManyToOne(() => DatoCobro, { nullable: true })
  @JoinColumn({ name: 'id_dato_cobro' })
  datoCobro?: DatoCobro;

  @ManyToOne(() => Mensaje, { nullable: true })
  @JoinColumn({ name: 'id_msj_pedido_tomado' })
  msjPedidoTomado?: Mensaje;

  @ManyToOne(() => Mensaje, { nullable: true })
  @JoinColumn({ name: 'id_msj_pedido_retirado' })
  msjPedidoRetirado?: Mensaje;
}
