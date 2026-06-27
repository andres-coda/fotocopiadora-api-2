import { Request } from 'express';
import { AuthParcialDto } from './authParcial.dto';
import { QueryRunner } from 'typeorm';

export interface RequestWithUser extends Request {
  user: AuthParcialDto;
  queryRunner: QueryRunner;
}