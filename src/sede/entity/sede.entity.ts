import { Base } from "../../base/entity/base.entity";
import { Column, Entity, OneToMany } from "typeorm";

@Entity('sede')
export class Sede extends Base {

  @Column({ type: 'varchar', length: 64, name:'nombre' })
  nombre!: string;

  /**
   * id_empresa no se mapea como FK TypeORM porque el RLS
   * de PostgreSQL lo maneja automáticamente. Se incluye como
   * columna simple para poder leerlo si es necesario.
   */
  @Column({ type: 'uuid', name: 'id_empresa' })
  idEmpresa!: string;

  constructor() {
    super()
  }
}
