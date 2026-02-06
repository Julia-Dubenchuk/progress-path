import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { JwtPayload } from './decorators/current-user.decorator';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not set');
    }

    const jwtFromRequest = (req: Request): string | null => {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return null;
      }

      const [scheme, token] = authHeader.split(' ');
      if (scheme?.toLowerCase() !== 'bearer' || !token) {
        return null;
      }

      return token;
    };

    super({
      jwtFromRequest,
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    return this.usersService.findOne(payload.sub);
  }
}
