import { Socket } from 'socket.io';
import { WsJwtAuthGuard } from 'src/auth/guards';

export type SocketIOMiddleWare = {
  (client: Socket, next: (err?: Error) => void);
};

export const SocketAuthMiddleware = (): SocketIOMiddleWare => {
  return (client: Socket, next) => {
    try {
      WsJwtAuthGuard.validateToken(client);
      next();
    } catch (err) {
      next(err);
    }
  };
};
