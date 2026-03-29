import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { Role } from "../rol/rol.enum";

export class AuthParcialDto{
    @IsNotEmpty()
    @IsString()
    sub!:string;
    
    @IsNotEmpty()
    @IsEmail()
    @IsString()
    email!:string;

    role!:Role;
}