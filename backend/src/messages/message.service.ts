import { ForbiddenException, Injectable } from '@nestjs/common';
import { MessageEntity } from './entities/message.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChannelGateway } from 'src/channel/channel.gateway';
import { User } from '@prisma/client';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class MessageService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async createMessage(message: MessageEntity) {
    const createdMessage = await this.prisma.message.create({
      data: {
        content: message.content,
        sender: { connect: { intraLogin: message.senderLogin } },
        destination: { connect: { id: message.channelId } },
      },
    });
    return createdMessage;
  }

  async findAll(user: User, channel: number) {
    if (
      !(await this.prisma.channels.findFirst({
        where: {
          id: channel,
          members: { some: { intraLogin: user.intraLogin } },
        },
      }))
    )
      throw new ForbiddenException('user not member of this channel');
    var messages = await this.prisma.message.findMany({
      where: {
        channelId: channel,
      },
      include: {
        sender: { select: { avatarLink: true } },
      },
    });
    const currUser = await this.prisma.user.findUnique({where: {id: user.id}, include: {blocked: true, blockedOf: true}});  
    messages = messages.filter((message) =>{return (!currUser.blocked.some((blocked) => blocked.intraLogin == message.senderLogin) && !currUser.blockedOf.some((blockedOf) => blockedOf.intraLogin == message.senderLogin))})
    return messages;
  }
}
