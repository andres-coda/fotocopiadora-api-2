import { Role } from "../../auth/rol/rol.enum";
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class UsuarioCrear{
    @IsNotEmpty()
    @IsEmail()
    email!:string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password!:string;

    @IsNotEmpty()
    @IsString()
    nombre!:string;

    @IsOptional()
    role?:Role;
}