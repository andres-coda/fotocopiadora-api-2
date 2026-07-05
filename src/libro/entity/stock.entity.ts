import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Libro } from "./libro.entity";


@Entity('stock')
export class Stock {
  @PrimaryColumn({type:'uuid', name:'id_libro'})
  idLibro!: string;

  @PrimaryColumn({type:'uuid', name:'id_empresa'})
  idEmpresa!: string;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion?: Date;

  @Column({ type: 'int', default: 0 })
  stock!: number;
  
  @OneToOne(() => Libro)
  @JoinColumn({ name: 'id_libro' })
  libro!: Libro;

  constructor() {
    this.stock = 0;
  }
}
