import {
  Injectable,
  Inject,
  LoggerService as NestLogger,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger as WinstonLogger } from 'winston';
import { IMetaParams } from './types';

@Injectable()
export class LoggerService implements NestLogger {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: WinstonLogger,
  ) {}

  log(message: string, { meta, context }: IMetaParams) {
    this.logger.info(message, { ...meta, context });
  }

  error(message: string, { trace, meta, context }: IMetaParams) {
    this.logger.error(message, { trace, ...meta, context });
  }

  warn(message: string, { meta, context }: IMetaParams) {
    this.logger.warn(message, { ...meta, context });
  }

  debug(message: string, { meta, context }: IMetaParams) {
    this.logger.debug?.(message, { ...meta, context });
  }

  verbose(message: string, { meta, context }: IMetaParams) {
    this.logger.verbose?.(message, { ...meta, context });
  }
}
