import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { LoggerService } from '../common/logger/logger.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: LoggerService,
  ) {}

  @Get()
  getHello(): string {
    this.logger.log('Calling getHello()', {
      context: AppController.name,
    });
    return this.appService.getHello();
  }
}
