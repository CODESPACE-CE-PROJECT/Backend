import { Injectable } from '@nestjs/common';
import { MailerService as Mailer } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  constructor(private readonly mailerService: Mailer) {}

  async sendWelcomeEmail(
    to: string,
    name: string,
    username: string,
    password: string,
  ) {
    try {
      await this.mailerService.sendMail({
        to: to,
        subject: 'ยินดีต้อนรับเข้าสู่ระบบ CODESPACE',
        template: './welcome',
        context: { name: name, username: username, password: password },
      });
    } catch (error) {
      console.log(error);
      throw new Error('Error Send Create Account Mail');
    }
  }

  async sendForgotPasswordEmail(
    to: string,
    name: string,
    username: string,
    password: string,
  ) {
    try {
      await this.mailerService.sendMail({
        to: to,
        subject: 'เปลี่ยนรหัสผ่านของคุณสำเร็จแล้ว',
        template: './forgotPassword',
        context: { name: name, username: username, password: password },
      });
    } catch (error) {
      console.log(error);
      throw new Error('Error Send Reset Password Mail');
    }
  }
}
