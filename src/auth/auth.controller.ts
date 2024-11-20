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

@ApiTags('Authenication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({ summary: 'Local Login (Student, Teacher, Admin)' })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: IRequest, @Body() _loginDTO: LoginDTO) {
    const { accessToken, refreshToken } = await this.authService.login(
      req.user,
    );
    return {
      message: 'Successfully logged in',
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout (Student, Teacher, Admin)' })
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
      const { accessToken, refreshToken, error } =
        await this.authService.googleLogin(req.user);
      const param = error
        ? `error=${error}`
        : `accessToken=${accessToken}&refreshToken=${refreshToken}`;
      res.redirect(`${this.configService.get('FRONTEND_URL')}?${param}`);
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
