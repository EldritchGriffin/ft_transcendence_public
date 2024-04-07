import { Injectable, Req } from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  'jwt',
) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest:
        ExtractJwt.fromExtractors([JwtStrategy.extractJwtFromCookie]),
        secretOrKey: config.get('JWT_SECRET'),
    });
  }

  private static extractJwtFromCookie(@Req() req: Request)
  {
    if (!req || !req.cookies)
      return null;
    return req.cookies['token'];
  }

  async validate(payload: {
    sub: string;
    username: string;
  }) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
        },
      });
    return user;
  }
}