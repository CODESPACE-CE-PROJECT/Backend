import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as crypto from 'crypto';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    const session = req.session;
    const state = session.oauthState || crypto.randomBytes(16).toString('hex');
    session.oauthState = state;
    return {
      scope: ['email', 'profile'],
      state,
      prompt: 'consent',
    };
  }
}
