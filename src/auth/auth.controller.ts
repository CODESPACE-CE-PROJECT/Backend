import {
  Get,
  Post,
  Controller,
  Request,
  UseGuards,
  Body,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from './local-auth.guard';
import { LoginDTO } from './dto/login.dto';
import { IRequest } from './interface/request.interface';
import { Response } from 'express';
import { GoogleAuthGuard } from './google-auth.guard';
import { IResponseGoogle } from './interface/response-google.inteface.ts';

@ApiTags('Authenication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @UseGuards(GoogleAuthGuard)
  @Get('google')
  async googlAuth(@Request() req: IResponseGoogle) {
    // Initiates the Google Oauth process
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleAuthRedirect(@Request() req: any, @Res() res: Response) {
    const accessToken = await this.authService.googleLogin(req.user);
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
    });
    res.redirect('/user/profile');
  }
}
