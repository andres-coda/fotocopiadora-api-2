import { Role } from "../../auth/rol/rol.enum";
import { UsuarioCrear } from "../dto/userCrear.dto";

export interface EditarUsuario{
  id:string;
  datos:UsuarioCrear
}

export interface ModificarRole{
    id: string; 
    role: Role;
}