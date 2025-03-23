import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions } from 'passport-auth0';
import { ConfigService } from '@nestjs/config';
import { Auth0Profile } from './types';

/* eslint-disable @typescript-eslint/no-unsafe-call */

@Injectable()
export class Auth0Strategy extends PassportStrategy(
  Strategy as new (...args: any[]) => Strategy,
  'auth0',
) {
  constructor(private configService: ConfigService) {
    const options: StrategyOptions = {
      domain: configService.get<string>('AUTH0_DOMAIN') as string,
      clientID: configService.get<string>('AUTH0_CLIENT_ID') as string,
      clientSecret: configService.get<string>('AUTH0_CLIENT_SECRET') as string,
      callbackURL: configService.get<string>('AUTH0_CALLBACK_URL') as string,
      scope: 'openid profile email',
      state: false,
      passReqToCallback: true,
    };

    super(options);
  }

  validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile: Auth0Profile,
  ) {
    return {
      accessToken,
      refreshToken,
      profile,
    };
  }
}

/* eslint-enable @typescript-eslint/no-unsafe-call */
