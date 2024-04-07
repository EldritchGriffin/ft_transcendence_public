import { Injectable, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-42';
import { AuthService } from '../auth.service';
import { User } from '@prisma/client';
import { AuthDto } from '../dto';
import passport from 'passport';

@Injectable()
export class FTStrategy extends PassportStrategy(Strategy, '42') {
  isTFA: boolean;
  constructor(
    private config: ConfigService,
    private auth: AuthService,
  ) {
    super({
      clientID: config.get('FT_UID'),
      clientSecret: config.get('FT_SECRET'),
      callbackURL: config.get('FT_CALLBACK'),
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    @Res() res,
  ) {
    const parsedProfile = JSON.parse(profile._raw);
    const dto: AuthDto = {
      id: parsedProfile.id,
      email: parsedProfile.email,
      login: parsedProfile.login,
      image_url: parsedProfile.image.link,
    };
    var user = await this.auth.checkUser(dto);
    if (!user) user = await this.auth.addUser(dto);
    res.user = user;
    if (user.TFA) super.callbackURL = this.config.get('FT_CALLBACK2');
    else super.callbackURL = this.config.get('FT_CALLBACK');
    return user || null;
  }
}
