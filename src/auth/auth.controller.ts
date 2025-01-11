import {
  Get,
  Post,
  Controller,
  Request,
  UseGuards,
  Body,
  HttpException,
  HttpStatus,
  Res,
  Session,
  Query,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from './local-auth.guard';
import { LoginDTO } from './dto/login.dto';
import { IRequest } from './interface/request.interface';
import { GoogleAuthGuard } from './google-auth.guard';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Record } from '@prisma/client/runtime/library';
import { JwtRefreshAuthGuard } from './refresh-auth.guard';
import { IPayload } from './interface/payload.interface';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ForgotPasswordDTO } from './dto/forgotPasswordDTO.dto';
import { UserService } from 'src/user/user.service';

@ApiTags('Authenication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({ summary: 'Local Login (Student, Teacher, Admin)' })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req: IRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() _loginDTO: LoginDTO,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(
      req.user,
    );

    const host = req.get('host')?.split(':')[0];

    res.cookie('accessToken', accessToken, {
      domain: host,
      path: '/',
      httpOnly: true,
      maxAge: 3600000,
    });

    res.cookie('refreshToken', refreshToken, {
      domain: host,
      path: '/',
      httpOnly: true,
      maxAge: 3600000,
    });

    return {
      message: 'Successfully Logged In',
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  @ApiOperation({ summary: 'Forgot Password (Student, Teacher, Admin)' })
  @Post('forgot-password')
  async forgoPassword(@Body() forgotPasswordDTO: ForgotPasswordDTO) {
    const invalidUser = await this.userService.getUserByEmail(
      forgotPasswordDTO.email,
    );

    if (!invalidUser) {
      throw new HttpException('Email Not Found', HttpStatus.NOT_FOUND);
    }
    await this.authService.forgotPassword(
      forgotPasswordDTO.email,
      invalidUser.username,
      invalidUser.firstName,
      invalidUser.lastName,
    );
    return {
      message: 'Successfully Send Mail',
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh Token (Student, Teacher, Admin)' })
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  refresh(@Request() req: IRequest) {
    const payload: IPayload = req.user;
    return {
      accessToken: this.authService.generateAccessToken(payload),
      refreshToken: this.authService.generateRefreshToken(payload),
    };
  }

  @ApiOperation({ summary: 'Google Login (Student, Teacher, Admin)' })
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  async googlAuth(@Session() _session: Record<string, any>) {}

  @ApiOperation({ summary: 'Google Login Callback (Student, Teacher, Admin)' })
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleAuthRedirect(
    @Req() req: any,
    @Res() res: Response,
    @Query('state') state: string,
    @Session() session: Record<string, any>,
  ) {
    try {
      if (state !== session.oauthState) {
        res.redirect(
          `${this.configService.get('FRONTEND_URL')}?error=invalid state google auth`,
        );
      }
      const { accessToken, refreshToken } = await this.authService.googleLogin(
        req.user,
      );

      const host = req.get('host')?.split(':')[0];
      const fullPath = req.protocol + '://' + req.get('host');
      res.cookie('accessToken', accessToken, {
        domain: host,
        path: '/',
        httpOnly: true,
        maxAge: 3600000,
      });

      res.cookie('refreshToken', refreshToken, {
        domain: host,
        path: '/',
        httpOnly: true,
        maxAge: 3600000,
      });
      res.redirect(`${fullPath}/`);
    } catch (error) {}
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout (Student, Teacher, Admin)' })
  @UseGuards(JwtAuthGuard)
  @Get('logout')
  async logout(@Request() req: IRequest) {
    const status = await this.authService.logout(req.user.username);
    if (!status) {
      throw new HttpException('Cannot Logout', HttpStatus.BAD_REQUEST);
    }
    return { message: 'Successfully logged out' };
  }
}
