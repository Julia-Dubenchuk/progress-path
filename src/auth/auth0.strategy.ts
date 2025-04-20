import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-auth0';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class Auth0Strategy extends PassportStrategy(
  Strategy as new (...args: any[]) => Strategy,
  'auth0',
) {
  constructor(private configService: ConfigService) {
    const options = {
      domain: configService.get<string>('AUTH0_DOMAIN') as string,
      clientID: configService.get<string>('AUTH0_CLIENT_ID') as string,
      clientSecret: configService.get<string>('AUTH0_CLIENT_SECRET') as string,
      callbackURL: configService.get<string>('AUTH0_CALLBACK_URL') as string,
      scope: ['openid', 'profile', 'email'],
      state: false,
      passReqToCallback: true,
    };

    super(options);
  }

  protected authorizationParams(): Record<string, string> {
    return {
      prompt: 'login',
      scope: 'openid profile email',
    };
  }

  /* eslint-disable @typescript-eslint/no-unsafe-assignment */
  /* eslint-disable @typescript-eslint/no-unsafe-member-access */
  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ) {
    const json = profile._json || {};

    const email = json.email;
    const firstName = json.given_name;
    const lastName = json.family_name;
    const pictureUrl: string = json.picture;
    const nickname = json.nickname;

    if (!email) {
      throw new UnauthorizedException('Google account did not return an email');
    }

    let pictureBuffer: Buffer | null = null;

    if (pictureUrl) {
      // 1) Download the image as arraybuffer
      const response = await axios.get(pictureUrl, {
        responseType: 'arraybuffer',
      });
      // 2) Convert to Node Buffer
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      pictureBuffer = Buffer.from(response.data, 'binary');
    }

    return {
      id: profile.id,
      email,
      firstName,
      lastName,
      picture: pictureBuffer,
      nickname,
    };
  }
}
