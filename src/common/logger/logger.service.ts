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
    this.logger.info(message, { ...this.normalizeMeta(meta), context });
  }

  error(message: string, { trace, meta, context }: IMetaParams) {
    this.logger.error(message, {
      trace,
      ...this.normalizeMeta(meta),
      context,
    });
  }

  warn(message: string, { meta, context }: IMetaParams) {
    this.logger.warn(message, { ...this.normalizeMeta(meta), context });
  }

  debug(message: string, { meta, context }: IMetaParams) {
    this.logger.debug?.(message, { ...this.normalizeMeta(meta), context });
  }

  verbose(message: string, { meta, context }: IMetaParams) {
    this.logger.verbose?.(message, { ...this.normalizeMeta(meta), context });
  }

  private normalizeMeta(meta?: IMetaParams['meta']): IMetaParams['meta'] {
    if (!meta) {
      return undefined;
    }

    return this.normalizeValue(meta) as IMetaParams['meta'];
  }

  private normalizeValue(value: unknown): unknown {
    if (value instanceof Error) {
      const errorWithExtras = value as Error & Record<string, unknown>;

      return {
        name: value.name,
        message: value.message,
        stack: value.stack,
        ...Object.fromEntries(
          Object.entries(errorWithExtras).map(([key, nestedValue]) => [
            key,
            this.normalizeValue(nestedValue),
          ]),
        ),
      };
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.normalizeValue(item));
    }

    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(
          ([key, nestedValue]) => [key, this.normalizeValue(nestedValue)],
        ),
      );
    }

    return value;
  }
}
