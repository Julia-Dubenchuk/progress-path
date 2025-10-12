import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Auth0User } from './types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import settings from '../config/settings';
import { LoggerService } from '../common/logger/logger.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.registerWithCredentials(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.loginWithCredentials(loginDto);
  }

  @Get('auth0')
  @UseGuards(AuthGuard('auth0'))
  loginWithAuth0() {
    // This endpoint initiates the Auth0 login process
  }

  @Get('auth0/callback')
  @UseGuards(AuthGuard('auth0'))
  async auth0Callback(@Req() req: { user: Auth0User }) {
    return this.authService.register(req.user);
  }

  @Get('auth0/logout')
  logoutAuth0(@Res() res: Response) {
    const returnTo = encodeURIComponent(
      `http://${settings.HOST}:${settings.PORT}/`,
    );
    const logoutURL =
      `http://${settings.auth0.domain}/v2/logout` +
      `?client_id=${settings.auth0.clientId}` +
      `&returnTo=${returnTo}`;
    res.redirect(logoutURL);
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 5, ttl: 3600 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a password reset link' })
  @ApiResponse({ status: 200, description: 'Reset link sent if email exists' })
  @ApiResponse({ status: 400, description: 'Invalid email payload' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiTooManyRequestsResponse({
    description: 'Rate limit exceeded – too many password reset requests',
  })
  @ApiBody({
    description: 'User email for password reset request',
    type: ForgotPasswordDto,
    examples: {
      example1: {
        summary: 'Valid request',
        value: { email: 'user@example.com' },
      },
    },
  })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    try {
      const ip = req.ip;
      await this.authService.forgotPassword(dto.email, ip);
      return {
        message:
          'If an account with that email exists, you’ll receive a reset link shortly.',
      };
    } catch (err) {
      if (err instanceof BadRequestException) {
        this.logger.warn(`ForgotPassword - BadRequest: ${err.message}`, {
          meta: { email: dto.email },
        });
        throw err;
      }
      this.logger.error('ForgotPassword - InternalError', {
        meta: { email: dto.email },
      });
      throw new InternalServerErrorException('Unable to process request');
    }
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 3600 } })
  @ApiOperation({ summary: 'Reset user password using token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or token' })
  @ApiTooManyRequestsResponse({
    description: 'Rate limit exceeded – too many reset password',
  })
  async resetPassword(
    @Body() { token, password }: ResetPasswordDto,
    @Req() req: Request,
  ) {
    const ip = req.ip;
    return this.authService.resetPassword(token, password, ip);
  }
}
