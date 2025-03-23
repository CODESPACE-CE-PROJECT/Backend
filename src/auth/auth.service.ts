import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginDTO } from './dto/login.dto';
import { Users } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { IResponseGoogle } from './interface/response-google.inteface.ts';
import { ConfigService } from '@nestjs/config';
import { IPayload } from './interface/payload.interface';
import { UtilsService } from 'src/utils/utils.service';
import { MailerService } from 'src/mailer/mailer.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private utilService: UtilsService,
    private mailerService: MailerService,
  ) {}

  async validateUser(loginDTO: LoginDTO) {
    const user = await this.userService.getUserByUsername(loginDTO.username);

    if (
      user &&
      (await bcrypt.compare(loginDTO.password, user.hashedPassword))
    ) {
      await this.userService.updateStatusByUsername(loginDTO.username, true);
      return user;
    }
    return null;
  }

  generateAccessToken(payload: IPayload) {
    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('JWT_SECRET'),
      expiresIn: '15m',
    });
  }

  generateRefreshToken(payload: IPayload) {
    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });
  }

  async login(user: Users) {
    const payload = {
      username: user.username,
      role: user.role,
      schoolId: user.schoolId,
    };
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  async forgotPassword(
    email: string,
    username: string,
    firstname: string,
    lastname: string,
  ) {
    try {
      const newPassword = await this.utilService.generatePassword();
      const resetPasswordDTO = {
        password: newPassword,
        confirmPassword: newPassword,
      };
      await this.userService.resetPasswordProfile(username, resetPasswordDTO);
      await this.mailerService.sendForgotPasswordEmail(
        email,
        `${firstname} ${lastname}`,
        username,
        newPassword,
      );
    } catch (error) {
      throw new Error('Error Send Forgot Password Mail');
    }
  }

  async googleLogin(responseGoogle: IResponseGoogle) {
    if (!responseGoogle) {
      throw new Error('Google login failed: No User information received.');
    }

    const user = await this.userService.getUserByEmail(
      responseGoogle.profile._json.email,
    );

    if (!user) {
      return { error: 'User Not Found' };
    }
    if (!user.allowLogin || !user.isEnable) {
      return { error: 'Permission denide' };
    }
    await this.userService.updateStatusByUsername(user?.username || '', true);
    const payload = {
      username: user.username,
      role: user.role,
      schoolId: user.schoolId,
    };
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
      error: '',
    };
  }

  async logout(username: string) {
    try {
      const status = await this.userService.updateStatusByUsername(
        username,
        false,
      );
      if (status) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      throw new Error('Error Logout User');
    }
  }
}
