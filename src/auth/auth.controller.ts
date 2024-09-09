import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Authenication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
}
