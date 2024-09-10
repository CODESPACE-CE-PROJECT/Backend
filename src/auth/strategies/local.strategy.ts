import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'username' });
  }

  async validate(username: string, password: string) {
    const loginDTO = { username: username, password: password };
    const user = await this.authService.validateUser(loginDTO);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
