import { Role } from "../../auth/rol/rol.enum";
import { Cliente } from "../../cliente/entity/cliente.entity";
import { ClienteResumen } from "../../cliente_resumen/entity/clienteResumen.entity";
import { Especificacion } from "../../especificacion/entity/especificacion.entity";
import { Libro } from "../../libro/entity/libro.entity";
import { LibroPedido } from "../../libro_pedido/entity/libroPedido.entity";
import { Materia } from "../../materia/entity/materia.entity";
import { Pedido } from "../../pedido/entity/pedido.entity";
import { Precio } from "../../precio/entity/precio.entity";
import { Propuesta } from "../../propuesta_pedido/entity/propuesta_pedido.entity";
import { Sede } from "../../sede/entity/sede.entity";
import { Stock } from "../../stock/entity/stock.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";

@Entity('user')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  fechaCreacion!: Date;

  @UpdateDateColumn()
  fechaActualizacion!: Date;

  @Column()
  deleted: boolean;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'varchar' })
  password!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @OneToMany(() => Cliente, cliente => cliente.user )
  clientes!: Cliente[];

  @OneToMany(() => ClienteResumen, cl => cl.user )
  resumenes!: ClienteResumen[];

  @OneToMany(() => Especificacion, esp => esp.user )
  especificaciones!: Especificacion[];

  @OneToMany(() => Libro, l => l.user )
  libros!: Libro[];

  @OneToMany(() => LibroPedido, lp => lp.user )
  librosPedidos!: LibroPedido[];

  @OneToMany(() => Materia, materia => materia.user )
  materias!: Materia[];

  @OneToMany(() => Pedido, pedido => pedido.user )
  pedidos!: Pedido[];

  @OneToMany(() => Precio, precio => precio.user )
  precios!: Precio[];

  @OneToMany(() => Propuesta, propuesta => propuesta.user )
  propuestas!: Propuesta[];

  @OneToMany(() => Sede, sede => sede.user )
  sedes!: Sede[];

  @OneToMany(() => Stock, stock => stock.user )
  stocks!: Stock[];

  @Column({ type: 'enum', enum: Role, default: Role.User })
  role!: string;

  constructor() {
    this.deleted = false;
  }
}