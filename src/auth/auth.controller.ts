import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Body,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { Auth0User } from './types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
      `http://localhost:${process.env.PORT}/`,
    );
    const logoutURL =
      `http://${process.env.AUTH0_DOMAIN}/v2/logout` +
      `?client_id=${process.env.AUTH0_CLIENT_ID}` +
      `&returnTo=${returnTo}`;
    res.redirect(logoutURL);
  }
}
