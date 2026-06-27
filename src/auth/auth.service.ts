import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthParcialDto } from './dto/authParcial.dto';
import { Request } from 'express';
import { UserService } from '../user/user.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Role } from './rol/rol.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private jwtService: JwtService
  ) { }

    async signIn(nombre: string, password: string): Promise<{ access_token: string }> {
    const rows = await this.dataSource.query(
      `SELECT id, nombre, rol, id_empresa
       FROM usuario
       WHERE nombre = $1
         AND password_hash = $2
         AND deleted = false`,
      [nombre, password],
    );

    if (!rows.length) throw new UnauthorizedException('Credenciales inválidas');

    const user = rows[0];

    const payload: AuthParcialDto = {
      sub: user.id,
      nombre: user.nombre,
      role: user.rol as Role,
      idEmpresa: user.id_empresa ?? null,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  getUserFromRequest(request: Request): AuthParcialDto {
    const authHeader = request.headers['authorization'];
    if (!authHeader) throw new UnauthorizedException('Token no provisto');

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Formato de token inválido');
    }

    try {
      return this.jwtService.verify<AuthParcialDto>(token);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}