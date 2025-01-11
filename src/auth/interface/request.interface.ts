import { Users } from '@prisma/client';
import { IResponseGoogle } from './response-google.inteface.ts';
import { Request } from 'express';

export interface IRequest extends Request {
  user: Users;
}

export interface IRequestGoogle {
  user: IResponseGoogle;
}
