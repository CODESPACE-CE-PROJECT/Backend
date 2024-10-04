import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginDTO } from './dto/login.dto';
import { Users } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { IResponseGoogle } from './interface/response-google.inteface.ts';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginDTO: LoginDTO) {
    const user = await this.userService.getUserByUsername(loginDTO.username);

    if (
      user &&
      (await bcrypt.compare(loginDTO.password, user.hashedPassword))
    ) {
      await this.userService.updateStatusByUsername(loginDTO.username, true)
      return user;
    }
    return null;
  }

  async login(user: Users) {
    const payload = {
      username: user.username,
      role: user.role,
      schoolId: user.schoolId,
    };
    return this.jwtService.sign(payload);
  }

  async googleLogin(responseGoogle: IResponseGoogle) {
    if (!responseGoogle) {
      throw new Error('Google login failed: No User information received.');
    }

    const user = await this.userService.getUserByEmail(
      responseGoogle.profile._json.email,
    );
    await this.userService.updateStatusByUsername(user?.username || '',true)
    if (!user) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }

    const payload = {
      username: user.username,
      role: user.role,
      schoolId: user.schoolId,
    };
    return this.jwtService.sign(payload);
  }

  async logout(username: string) {
    try {
      const status = await this.userService.updateStatusByUsername(username,false)
      if(status){
        return true
      }else{
        return false
      }
    } catch (error) {
     throw new Error('Error Logout User') 
    }
  }
}
