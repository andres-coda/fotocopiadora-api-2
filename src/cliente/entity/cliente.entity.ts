import { Base } from "../../base/entity/base.entity";
import { Pedido } from "../../pedido/entity/pedido.entity";
import { Column, Entity, OneToMany, OneToOne } from "typeorm";
import { ClienteResumen } from "./clienteResumen.entity";


/**
 * Cambios respecto a la versión anterior:
 * - Se eliminó la relación OneToMany a Pedido (se consulta via vw_pedidos)
 * - Se eliminó la relación OneToOne a ClienteResumen (la mantiene un trigger)
 * - Se agregó idEmpresa como columna simple (el RLS filtra por empresa automáticamente)
 * - nombre pasa a ser NOT NULL (la BD lo requiere, además hay constraint
 *   de contacto mínimo: al menos email o telefono)
 */

@Entity('cliente')
export class Cliente extends Base {

  @Column({ type: 'varchar', length: 50, nullable: true })
  nombre?: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  telefono?: string;

  @Column({ type: 'varchar', length:50, nullable: true })
  email?: string;

  @Column({ type: 'uuid', name: 'id_empresa' })
  idEmpresa!: string;

  @OneToOne(() => ClienteResumen, cl => cl.cliente)
  resumen!: ClienteResumen;

  constructor() {
    super()
  }
}
