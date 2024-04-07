import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor( readonly config: ConfigService)
  {}
  root(req, res) {
    res.redirect(`http://${this.config.get("HOSTNAME")}:3001/user/me`);
  }
}
