import { Controller, Get } from '@nestjs/common';
import { MailerService } from './mailer.service';

@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Get()
  async TestSendMail() {
    await this.mailerService.sendWelcomeEmail(
      'vitoon.sdf@gmail.com',
      'วิฑูรย์ วัชรกฤตเวคิน',
      'withun',
      'withun123',
    );
    await this.mailerService.sendResetPassword(
      'vitoon.sdf@gmail.com',
      'วิฑูรย์ วัชรกฤตเวคิน',
      'withun',
      'withun233343',
    );
    return { message: 'success send mail' };
  }
}
