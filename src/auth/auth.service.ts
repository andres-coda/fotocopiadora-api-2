import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthParcialDto } from './dto/authParcial.dto';
import { Request } from 'express';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryFailedError } from 'typeorm';
import { Role } from './rol/rol.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private jwtService: JwtService
  ) { }

  async signIn(nombre: string, password: string): Promise<{ access_token: string }> {
    let rows: any[];

    try {
      rows = await this.dataSource.query(
        `SELECT * FROM fc_login($1, $2)`,
        [nombre, password],
      );
    } catch (error) {
      // fc_login señala credenciales inválidas con RAISE EXCEPTION (SQLSTATE P0001).
      // Sin este mapeo Nest responde 500 "Internal server error" y se pierde el
      // mensaje de negocio que la DB ya construyó.
      const driverError =
        error instanceof QueryFailedError
          ? (error.driverError as { code?: string; message?: string })
          : null;

      if (driverError?.code === 'P0001') {
        throw new UnauthorizedException(driverError.message);
      }

      throw error;
    }

    const [row] = rows;

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