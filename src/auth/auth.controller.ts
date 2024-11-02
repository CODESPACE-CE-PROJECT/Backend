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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from './local-auth.guard';
import { LoginDTO } from './dto/login.dto';
import { IRequest } from './interface/request.interface';
import { GoogleAuthGuard } from './google-auth.guard';
import { IResponseGoogle } from './interface/response-google.inteface.ts';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

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
    const accessToken = await this.authService.login(req.user);
    return { message: 'Successfully logged in', accessToken: accessToken };
  }

  @ApiOperation({ summary: 'Google Login (Student, Teacher, Admin)' })
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  async googlAuth(@Request() _req: IResponseGoogle) {
    // Initiates the Google Oauth process
  }

  @ApiOperation({ summary: 'Google Login Callback (Student, Teacher, Admin)' })
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleAuthRedirect(
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken } = await this.authService.googleLogin(req.user);
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: 'localhost',
    });
    res.redirect(`${this.configService.get('FRONTEND_REDIRECT_URL')}/`);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout (Student, Teacher, Admin)' })
  @UseGuards(AuthGuard('jwt'))
  @Get('logout')
  async logout(@Request() req: IRequest) {
    const status = await this.authService.logout(req.user.username);
    if (!status) {
      throw new HttpException('Cannot Logout', HttpStatus.BAD_REQUEST);
    }
    return { message: 'Successfully logged out' };
  }
}
