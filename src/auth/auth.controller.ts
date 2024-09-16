import {
  Get,
  Post,
  Controller,
  Request,
  UseGuards,
  Body,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from './local-auth.guard';
import { LoginDTO } from './dto/login.dto';
import { IRequest } from './interface/request.interface';
import { Response } from 'express';
import { GoogleAuthGuard } from './google-auth.guard';
import { IResponseGoogle } from './interface/response-google.inteface.ts';
import { AuthGuard } from '@nestjs/passport';
@ApiTags('Authenication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Local Login (Student, Teacher, Admin)' })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req: IRequest,
    @Body() loginDTO: LoginDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessToken = await this.authService.login(req.user);
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
    });

    return { message: 'Successfully logged in' };
  }

  @ApiOperation({ summary: 'Google Login (Student, Teacher, Admin)' })
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  async googlAuth(@Request() req: IResponseGoogle) {
    // Initiates the Google Oauth process
  }

  @ApiOperation({ summary: 'Google Login Callback (Student, Teacher, Admin)' })
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleAuthRedirect(
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessToken = await this.authService.googleLogin(req.user);
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
    });
    res.redirect('/user/profile');
  }

  @ApiOperation({ summary: 'Logout (Student, Teacher, Admin)' })
  @UseGuards(AuthGuard('jwt'))
  @Get('logout')
  async logout(
    @Request() req: IRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const status = await this.authService.logout(req.user.username);
    if (!status) {
      throw new HttpException('Cannot Logout', HttpStatus.BAD_REQUEST);
    }
    res.clearCookie('accessToken', {
      httpOnly: true,
    });
    return { message: 'Successfully logged out' };
  }
}
