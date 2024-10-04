import { Controller, Get } from '@nestjs/common';
import { InitService } from './init.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Init')
@Controller('init')
export class InitController {
  constructor(private readonly initService: InitService) {}

  @ApiOperation({ summary: 'Inital Admin Account' })
  @Get('initAdmin')
  async InitialAdminAccount() {
    const user = await this.initService.InitialAdmin();
    return {
      message: 'Successfully Create Inital Admin',
      data: user,
    };
  }
}
