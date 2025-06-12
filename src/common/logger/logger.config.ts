import {
  utilities as nestWinstonModuleUtilities,
  WinstonModuleOptions,
} from 'nest-winston';
import * as winston from 'winston';
import { ConfigService } from '@nestjs/config';

export function createWinstonConfig(
  config: ConfigService,
): WinstonModuleOptions {
  const level = config.get<string>('LOG_LEVEL') || 'info';
  const isProduction = config.get<string>('NODE_ENV') === 'production';

  const transports: winston.transport[] = [];

  transports.push(
    new winston.transports.Console({
      level,
      format: winston.format.combine(
        winston.format.timestamp(),
        isProduction
          ? winston.format.json()
          : nestWinstonModuleUtilities.format.nestLike('ProgressPath', {
              prettyPrint: true,
            }),
      ),
    }),
  );

  if (isProduction) {
    transports.push(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    );

    transports.push(
      new winston.transports.File({
        filename: 'logs/combined.log',
        level,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    );
  }

  return {
    level,
    transports,
    exitOnError: false,
  };
}
