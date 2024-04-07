import {
  Body,
  Injectable,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import cookieParser from 'cookie-parser';
import { authenticator } from 'otplib';
import { User } from '@prisma/client';
import { toDataURL } from 'qrcode';
import { argon2d } from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private jwt: JwtService,
  ) {}

  async addUser(dto: AuthDto) {
    try {
      const user = await this.prisma.user.create({
        data: {
          intraLogin: dto.login,
          avatarLink: dto.image_url,
        },
      });
      return user;
    } catch (error) {
      return null;
    }
  }

  async checkUser(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        intraLogin: dto.login,
      },
    });
    return user || null;
  }

  async signin(@Req() req, @Res() res) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
    });
    if (user.TFA) {
      delete user.twoFaSecret;
      res.cookie(
        'loginSession',
        Buffer.from(JSON.stringify(user)).toString('base64'),
        {
          path: '/',
        },
      );
      res.redirect(this.config.get('FT_CALLBACK2'));
    } else {
      const token = await this.signToken(user.id, user.intraLogin);
      res.cookie('token', token.access_token, {});
      if (!user.nickname) res.redirect(`http://${this.config.get("HOSTNAME")}:3000/editProfile`);
      else res.redirect(`http://${this.config.get("HOSTNAME")}:3000/user/me`);
    }
  }

  async signinTFA(@Req() req, @Body() bod, @Res() res) {
    if (!req.cookies['loginSession']) throw new UnauthorizedException();
    try {
    const tfaSession = Buffer.from(
      req.cookies['loginSession'],
      'base64',
    ).toString('ascii');
    const user = JSON.parse(tfaSession);
    const secret = (
      await this.prisma.user.findUnique({ where: { id: user.id } })
    ).twoFaSecret;
    if (!secret) throw new UnauthorizedException('TFA not enabled');
    const isValid = authenticator.verify({ token: bod.code, secret });
    if (isValid) {
      const token = await this.signToken(user.id, user.intraLogin);
      res.cookie('token', token.access_token);
      res.redirect(`http://${this.config.get("HOSTNAME")}:3001/user/me`);
    } else throw new UnauthorizedException('Invalid code');
  } catch (error) {
    throw new UnauthorizedException("Invalid Code");
  }
  }

  async signToken(
    userId: string,
    intraLogin: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      intraLogin,
    };
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '24h',
      secret: secret,
    });

    return {
      access_token: token,
    };
  }
}
