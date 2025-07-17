import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from '../logger/logger.service';
import settings from '../../config/settings';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse<Response>();
    const request: Request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const nodeEnv = settings.NODE_ENV;
    const isProd = nodeEnv === 'production';

    const basePayload = {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message:
        exception instanceof HttpException
          ? exception.getResponse()
          : 'Internal server error',
    };

    const devExtras =
      !isProd && exception instanceof Error ? { stack: exception.stack } : {};
    const prodExtras = isProd ? { errorId: this.generateErrorId() } : {};

    const errorResponse = {
      ...basePayload,
      ...devExtras,
      ...prodExtras,
    };

    const logMeta =
      exception instanceof Error
        ? {
            stack: exception.stack,
            ...(isProd ? { errorId: errorResponse.errorId } : {}),
          }
        : { raw: exception };

    this.logger.error(
      `HTTP ${status} Error on ${request.method} ${request.url}`,
      {
        meta: logMeta,
      },
    );

    response.status(status).json(errorResponse);
  }

  private generateErrorId(): string {
    return uuidv4();
  }
}
