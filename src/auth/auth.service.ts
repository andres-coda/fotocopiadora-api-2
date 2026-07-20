import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthParcialDto } from './dto/authParcial.dto';
import { Request } from 'express';
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
      
      const [row] = await this.dataSource.query(
      `SELECT * FROM fc_login($1, $2)`,
      [nombre, password],
    );
    
    if (!row) throw new UnauthorizedException('Credenciales inválidas');

    const user = row;

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