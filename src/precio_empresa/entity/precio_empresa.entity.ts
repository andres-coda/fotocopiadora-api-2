import { Base } from "@src/base/entity/base.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('precio_empresa')
export class PrecioEmpresa extends Base{  
    @Column({type:'uuid', name: 'id_precio'})
    id!:string;

    @Column({type:'varchar', length:255})
    detalle?:string;

    @Column({type:'numeric' })
    importe?:string;
}