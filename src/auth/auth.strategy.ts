import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

interface JwtPayload {
  sub: string;
  email: string;
}

interface JwtValidatedUser {
  userId: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const token = req?.cookies?.access_token ?? null;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'supersecret',
    });
  }

  validate(payload: JwtPayload): JwtValidatedUser {
    return { userId: payload.sub, email: payload.email };
  }
}
