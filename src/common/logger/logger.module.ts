import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule, WinstonModuleOptions } from 'nest-winston';
import { createWinstonConfig } from './logger.config';
import { LoggerService } from './logger.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): WinstonModuleOptions => {
        return createWinstonConfig(configService);
      },
    }),
  ],
  providers: [LoggerService],
  exports: [LoggerService, WinstonModule],
})
export class LoggerModule {}
