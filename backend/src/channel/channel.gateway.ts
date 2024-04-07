import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  MessageEntity,
  MuteEntity,
} from 'src/messages/entities/message.entity';
import { DMEvent } from './types/channel';
import { UseGuards } from '@nestjs/common';
import { WsJwtAuthGuard } from 'src/auth/guards';
import { SocketAuthMiddleware } from 'src/auth/middlewares/ws-middleware/ws.mw';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChannelService } from './channel.service';
import { EventEmitter } from 'stream';
import { MessageService } from 'src/messages/message.service';
import { use } from 'passport';
export const channelType: { DM: 'DM'; Channel: 'Channel' } = {
  DM: 'DM',
  Channel: 'Channel',
};
export const accessType: {
  Private: 'Private';
  Protected: 'Protected';
  Public: 'Public';
} = { Private: 'Private', Protected: 'Protected', Public: 'Public' };
export type channelType = (typeof channelType)[keyof typeof channelType];
export type accessType = (typeof accessType)[keyof typeof accessType];

@WebSocketGateway({
  namespace: '/channels',
  cors: {
    origin: '*',
  },
})
@UseGuards(WsJwtAuthGuard)
export class ChannelGateway {
  Users: Map<string, Socket[]>;
  MutedFrom: Map<string, Map<number, number>>;
  @WebSocketServer()
  server: Server;
  constructor(
    private prisma: PrismaService,
    private msg: MessageService,
  ) {
    this.Users = new Map<string, Socket[]>();
    this.MutedFrom = new Map<string, Map<number, number>>();
  }

  afterInit(client: Socket) {
    client.use(SocketAuthMiddleware() as any);
  }

  async handleConnection(client: Socket) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: client.handshake.headers.cookie,
      },
      select: {
        friends: true,
        joinedChannels: true,
        intraLogin: true,
        status: true,
      },
    });
    if (!user) return new WsException('invalid user');
    client.join(user.intraLogin);
    user.joinedChannels.forEach(function (channel) {
      client.join(channel.id.toString());
    });
    const status = await this.prisma.user.update({
      where: {
        id: client.handshake.headers.cookie,
      },
      data: {
        status: 'online',
      },
      select: {
        status: true,
      },
    });
    if (!status) return new WsException('invalid user');
    this.server.emit('online', user.intraLogin);
    if (!this.Users[user.intraLogin]) this.Users[user.intraLogin] = new Array();
    this.Users[user.intraLogin].push(client);
  }

  async handleDisconnect(client: Socket) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: client.handshake.headers.cookie,
      },
      select: {
        friends: true,
        joinedChannels: true,
        intraLogin: true,
      },
    });
    if (!user) return new WsException('invalid user');
    client.leave(user.intraLogin);
    user.joinedChannels.forEach(function (channel) {
      client.leave(channel.id.toString());
    });
    this.Users[user.intraLogin].pop();
    if (
      !this.Users[user.intraLogin] ||
      this.Users[user.intraLogin].length == 0
    ) {
      const status = await this.prisma.user.update({
        where: {
          id: client.handshake.headers.cookie,
        },
        data: {
          status: 'offline',
        },
        select: {
          status: true,
        },
      });
      if (!status) return new WsException('invalid user');
      this.server.emit('offline', user.intraLogin);
      delete this.Users[user.intraLogin];
    }
  }

  messageSent(message: MessageEntity) {
    this.msg.createMessage(message);
    this.server.to(message.channelId.toString()).except("BLOCKED_OF_TMP").emit('messageReceived', {
      channelId: message.channelId,
      senderLogin: message.senderLogin,
      sender: { avatarLink: message.senderAvatar },
      content: message.content,
    });
  }

  async userInChannel(client: Socket, message: MessageEntity) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: client.handshake.headers.cookie,
      },
      select: {
        id: true,
        joinedChannels: true,
        avatarLink: true,
        intraLogin: true,
        blocked: true,
        blockedOf: true,
      },
    });
    if (!user) throw new WsException('invalid user');
    message.senderLogin = user.intraLogin;
    message.senderAvatar = user.avatarLink;
    if (
      !user.joinedChannels.some((channel) => channel.id === message.channelId)
    )
      throw new WsException('Not a member of this channel');
    if (this.MutedFrom[user.intraLogin])
      if (this.MutedFrom[user.intraLogin][message.channelId] > Date.now())
        throw new WsException('You are muted');
    return user;
  }
  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, message: MessageEntity) {
    try {
      if (!message || !message.channelId || !message.content) throw 5;
      const channel = await this.prisma.channels.findUnique({
        where: { id: message.channelId },
        select: { type: true, members: { select: { intraLogin: true } } },
      });
      if (!channel) throw new WsException('invalid channel');
      const user = await this.userInChannel(client, message);
      const blockedIds = user.blocked.map((blocked) => blocked.intraLogin);
      const blockedOfIds = user.blockedOf.map((blockedOf) => blockedOf.intraLogin);
      if (channel.type == channelType['DM']) {
        if (channel.members[0].intraLogin == user.intraLogin)
          var dst = channel.members[1].intraLogin;
        else var dst = channel.members[0].intraLogin;
        if (
          user.blocked.some((blocked) => blocked.intraLogin == dst) ||
          user.blockedOf.some((blockedOf) => blockedOf.intraLogin == dst)
        )
          throw new WsException('Ur blocked');
      }
      message.senderAvatar = user.avatarLink;
      blockedOfIds.forEach((blockedOfId) => {
        this.Users[blockedOfId].forEach((socket) => {socket.join("BLOCKED_OF_TMP")});
      })
      blockedIds.forEach((blockedId) => {
        this.Users[blockedId].forEach((socket) => {socket.join("BLOCKED_OF_TMP")});
      })
      this.messageSent(message);
      blockedOfIds.forEach((blockedOfId) => {
        this.Users[blockedOfId].forEach((socket) => {socket.leave("BLOCKED_OF_TMP")});
      })
      blockedIds.forEach((blockedId) => {
        this.Users[blockedId].forEach((socket) => {socket.leave("BLOCKED_OF_TMP")});
      })
      return 0;
    } catch (err) {
      return err;
    }
  }

  sendMessage(message: MessageEntity) {
    this.server.emit('DM', message);
  }

  @SubscribeMessage('mute')
  async muteUser(client: Socket, message: MuteEntity) {
    try {
      if (!message.toMuteLogin)
        throw new WsException('provide a user in the body');
      message.senderLogin = (
        await this.prisma.user.findUnique({
          where: {
            id: client.handshake.headers.cookie,
          },
        })
      ).intraLogin;
      const channel = await this.prisma.channels.findUnique({
        where: {
          id: message.channelId,
        },
        select: {
          admins: true,
          members: true,
          ownerLogin: true,
          type: true,
        },
      });
      if (!channel) throw new WsException('channel not found');
      if (channel.type == channelType['DM'])
        throw new WsException('can not mute in DM');
      if (
        !channel.members.some(
          (member) => member.intraLogin == message.toMuteLogin,
        )
      )
        throw new WsException(
          'the user you want to mute is not member of this channel',
        );
      if (
        !channel.admins.some((admin) => admin.intraLogin == message.senderLogin)
      )
        throw new WsException('you do not have permissions to mute a user');
      if (
        message.senderLogin != channel.ownerLogin &&
        channel.admins.some((admin) => admin.intraLogin == message.toMuteLogin)
      )
        throw new WsException('only owner allowed to mute admins');
      if (message.senderLogin == message.toMuteLogin)
        throw new WsException('can not mute self');
      if (message.mutePeriod < 1 || message.mutePeriod > 3)
        throw new WsException('invalid mute period');
      if (!this.MutedFrom[message.toMuteLogin])
        this.MutedFrom[message.toMuteLogin] = new Map<number, boolean>();
      if (
        this.MutedFrom[message.toMuteLogin][message.channelId] &&
        this.MutedFrom[message.toMuteLogin][message.channelId] > Date.now()
      )
        throw new WsException('already muted');
      if (message.mutePeriod == 1)
        this.MutedFrom[message.toMuteLogin][message.channelId] =
          Date.now() + 60000;
      else if (message.mutePeriod == 2)
        this.MutedFrom[message.toMuteLogin][message.channelId] =
          Date.now() + 3600000;
      else
        this.MutedFrom[message.toMuteLogin][message.channelId] =
          Date.now() + 86400000;
      return 0;
    } catch (err) {
      return err;
    }
  }

  @SubscribeMessage('unmute')
  async unmute(client: Socket, message: MuteEntity) {
    try {
      if (!message.toMuteLogin)
        throw new WsException('provide a user in the body');
      message.senderLogin = (
        await this.prisma.user.findUnique({
          where: {
            id: client.handshake.headers.cookie,
          },
        })
      ).intraLogin;
      const channel = await this.prisma.channels.findUnique({
        where: {
          id: message.channelId,
        },
        select: {
          admins: true,
          members: true,
          ownerLogin: true,
          type: true,
        },
      });
      if (!channel) throw new WsException('channel not found');
      if (channel.type == channelType['DM'])
        throw new WsException('can not unmute in DM');
      if (
        !channel.members.some(
          (member) => member.intraLogin == message.toMuteLogin,
        )
      )
        throw new WsException(
          'the user you want to unmute is not member of this channel',
        );
      if (
        !channel.admins.some((admin) => admin.intraLogin == message.senderLogin)
      )
        throw new WsException('you do not have permissions to unmute a user');
      if (
        message.senderLogin != channel.ownerLogin &&
        channel.admins.some((admin) => admin.intraLogin == message.toMuteLogin)
      )
        throw new WsException('only owner allowed to unmute admins');
      if (message.senderLogin == message.toMuteLogin)
        throw new WsException('can not unmute self');
      if (
        this.MutedFrom[message.toMuteLogin] == undefined ||
        this.MutedFrom[message.toMuteLogin][message.channelId] == undefined ||
        this.MutedFrom[message.toMuteLogin][message.channelId] <= Date.now()
      )
        throw new WsException('not muted');
      this.MutedFrom[message.toMuteLogin][message.channelId] = 0; 
      delete this.MutedFrom[message.toMuteLogin][message.channelId];
      return 0;
    } catch (err) {
      return err;
    }
  }

  async leaveChannel(user: string, channel: string) {
    const channels = this.Users[user];
    if (!channels) return; 
    for (let i = 0; i < channels.length; i++) {
      if (channels[i].rooms.has(channel)) {
        channels[i].leave(channel);
      }
    }
  }

  async joinChannel(user: string, channel: string) {
    const channels = this.Users[user];
    if (!channels) return;
    for (let i = 0; i < channels.length; i++) {
      if (!channels[i].rooms.has(channel)) {
        channels[i].join(channel);
      }
    }
  }
}
