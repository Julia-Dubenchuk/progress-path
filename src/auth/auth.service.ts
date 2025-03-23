import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Auth0User } from './types';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  login(user: Auth0User) {
    const payload = {
      sub: user.profile.id,
      email: user.profile.emails[0].value,
      name: user.profile.displayName,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: payload,
    };
  }
}
