import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { gameService } from './game.service';
import { SocketAuthMiddleware } from 'src/auth/middlewares/ws-middleware/ws.mw';
import { ChannelGateway } from 'src/channel/channel.gateway';

interface User {
  intraLogin: string;
  nickname: string;
  avatarLink: string;
}
@WebSocketGateway({
  namespace: '/game',
  cors: {
    origin: `http://${process.env.HOSTNAME}:3000`,
  },
})
export class gameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private gameService: gameService,
    private prisma: PrismaService,
    private channelGateway: ChannelGateway,
  ) {}
  private Users = new Map<string, Socket>();
  @WebSocketServer()
  server: Server;

  afterInit(client: Socket) {
    client.use(SocketAuthMiddleware() as any);
  }

  async getUser(cookie: string) {
    return this.prisma.user.findUnique({
      where: { id: cookie },
      select: { intraLogin: true, nickname: true, avatarLink: true },
    });
  }

  async handleConnection(client: Socket) {
    const user = await this.getUser(client.handshake.headers.cookie);
    if (!user) {
      client.disconnect();
      return;
    }
    if (this.Users.has(user.intraLogin)) {
      this.server.to(client.id).emit('error', 'You are already in a game!');
      client.disconnect();
    } else this.Users.set(user.intraLogin, client);
  }
  async handleDisconnect(client: Socket) {
    const user = await this.getUser(client.handshake.headers.cookie);
    if (!user) return;
    const disconnect = this.Users.get(user.intraLogin);
    if (disconnect && disconnect.id === client.id) {
      this.gameService.leaveGame(user.intraLogin);
      this.gameService.clearDanglingGames(user.intraLogin);
      this.channelGateway.server.emit('offgame', user.intraLogin);
      this.channelGateway.server.emit('online', user.intraLogin);
      await this.prisma.user.update({
        where: { id: client.handshake.headers.cookie },
        data: { status: 'online' },
      });
      this.Users.delete(user.intraLogin);
    }
  }
  @SubscribeMessage('move')
  handleMove(
    @MessageBody() data: { gameId: string; username: string; position: any },
  ) {
    this.gameService.move(data);
  }

  @SubscribeMessage('joinGame')
  async handleQueue(
    client: Socket,
    payload: {
      gameId: string | null;
      mode: string | null;
      expectedPlayer: string | null;
    },
  ) {
    const user = await this.getUser(client.handshake.headers.cookie);
    const gameId = await this.gameService.joinGame(user.intraLogin, payload);
    if (!gameId) {
      this.server.to(client.id).emit('error', 'You cannot join this game');
      return;
    } else {
      this.channelGateway.server.emit('ingame', user.intraLogin);
      await this.prisma.user.update({
        where: { id: client.handshake.headers.cookie },
        data: { status: 'ingame' },
      });
      client.join(gameId);
      const game = this.gameService.getGame(gameId);
      if (game.status === 'waiting') {
        this.server.to(gameId).emit('waiting');
        if (game.expectedPlayer) {
          this.channelGateway.server
            .to(game.expectedPlayer)
            .emit('gameInvite', {
              action: `gameInvite${gameId}`,
              sender: {
                avatarLink: user.avatarLink,
                intraLogin: user.intraLogin,
                nickname: user.nickname,
              },
              receiver: game.expectedPlayer,
            });
        }
      } else if (game.status === 'ready') {
        this.server.to(gameId).emit('gameReady', game);
        this.gameService.startGameLoop(gameId, this.server);
      }
    }
  }
}
