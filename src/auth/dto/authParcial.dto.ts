import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { Role } from "../rol/rol.enum";

export class AuthParcialDto {
    @IsNotEmpty()
    @IsUUID()
    sub!: string;

    @IsNotEmpty()
    @IsString()
    nombre!: string;

    role!: Role;

    @IsOptional()
    @IsUUID()
    idEmpresa?: string | null;
}