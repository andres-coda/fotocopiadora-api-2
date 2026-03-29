import { Request } from 'express';
import { AuthParcialDto } from './authParcial.dto';

export interface RequestWithUser extends Request {
  user: AuthParcialDto;
}