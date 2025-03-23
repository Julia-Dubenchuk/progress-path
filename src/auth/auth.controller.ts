import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Auth0User } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('auth0')
  @UseGuards(AuthGuard('auth0'))
  login() {
    // This endpoint initiates the Auth0 login process
  }

  @Get('auth0/callback')
  @UseGuards(AuthGuard('auth0'))
  callback(@Req() req: { user: Auth0User }) {
    return this.authService.login(req.user);
  }
}
