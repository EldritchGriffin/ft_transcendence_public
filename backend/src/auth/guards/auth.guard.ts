import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';

@Injectable()
export class JwtGuard extends AuthGuard('jwt'){
  constructor() {
    super();
  }
}

@Injectable()
export class FTGuard extends AuthGuard('42')
{
  constructor() {
    super();
  }

    async canActivate(context: ExecutionContext) {
      const canActive = (await super.canActivate(context)) as boolean;
      const request = context.switchToHttp().getRequest();
      super.logIn(request);
      return canActive;
  }
}

@Injectable()
export class WsJwtAuthGuard implements CanActivate
{
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getType() !== 'ws')
      return true;
    const client: Socket = context.switchToWs().getClient();

    try {
      WsJwtAuthGuard.validateToken(client);
    } catch (err)
    {
      return false;
    }
   return true;
  }

  static validateToken(client: Socket)
  {
    const {authorization} = client.handshake.headers;
    if (!authorization)
      throw Error("No token");
    const token = authorization.split(' ')[1];
    if (!token)
      throw Error("No token");
    const payload = (new JwtService()).verify(token, {secret: (new ConfigService().get('JWT_SECRET'))});
    client.handshake.headers.cookie = payload.sub;
    return payload;
  }
}