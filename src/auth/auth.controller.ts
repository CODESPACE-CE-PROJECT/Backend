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
import { Record } from '@prisma/client/runtime/library';
import { JwtRefreshAuthGuard } from './refresh-auth.guard';
import { IPayload } from './interface/payload.interface';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ForgotPasswordDTO } from './dto/forgotPasswordDTO.dto';
import { UserService } from 'src/user/user.service';

@ApiBearerAuth()
@ApiTags('Authenication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({ summary: 'Local Login (Student, Teacher, Admin)' })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: IRequest, @Body() _loginDTO: LoginDTO) {
    const { accessToken, refreshToken } = await this.authService.login(
      req.user,
    );

    return {
      message: 'Successfully Logged In',
      accessToken,
      refreshToken,
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
      const jsonData: { rawState: string; referer: string } = JSON.parse(state);
      if (jsonData.rawState !== session.oauthState) {
        res.redirect(`${jsonData.referer}?error=invalid state google auth`);
      }
      const { accessToken, refreshToken, error } =
        await this.authService.googleLogin(req.user);

      res.redirect(
        `${jsonData.referer}/login?accessToken=${accessToken}&refreshToken=${refreshToken}&error=${error}`,
      );
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
