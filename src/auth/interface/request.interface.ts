import { Users } from '@prisma/client';
import { IResponseGoogle } from './response-google.inteface.ts';

export interface IRequest {
  user: Users;
}

export interface IRequestGoogle {
  user: IResponseGoogle;
}
