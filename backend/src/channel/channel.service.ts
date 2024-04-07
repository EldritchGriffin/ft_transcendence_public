import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { PrismaService } from 'src/prisma/prisma.service';
import { Channel, ChannelDto } from './dto';
import { User } from '@prisma/client';
import * as argon2 from 'argon2';
import { ChannelGateway } from './channel.gateway';
import { cpuUsage } from 'process';
import { Not } from 'typeorm';
import { use } from 'passport';
import { channel } from 'diagnostics_channel';

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

@Injectable()
export class ChannelService {
  constructor(
    private prisma: PrismaService,
    private gateway: ChannelGateway,
  ) {}

  async createChannel(creator: User, channel: ChannelDto) {
    let access;
    let createdChannel;
  
    if (!channel.title || channel.title.length < 3)
      throw new ForbiddenException('title must be at least 3 characters long');
    if (
      channel.access == 2 &&
      (!channel.password || channel.password.length < 8)
    )
      throw new ForbiddenException(
        'password must be provided for protected channel',
      );
    if (channel.access == 1) access = accessType['Private'];
    else if (channel.access == 2) access = accessType['Protected'];
    else access = accessType['Public'];
    createdChannel = await this.prisma.channels.create({
      data: {
        title: channel.title,
        description: channel.description ? channel.description : null,
        password:
          access == accessType['Protected']
            ? await argon2.hash(channel.password)
            : null,
        access: access,
        type: channelType['Channel'],
        ownerLogin: creator.intraLogin,
        members: { connect: { intraLogin: creator.intraLogin } },
        admins: { connect: { intraLogin: creator.intraLogin } },
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        password: false,
        access: true,
        ownerLogin: true,
        bannedUsers: true,
        type: true,
        admins: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
        members: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
      },
    });
    if (!createdChannel)
      throw new ForbiddenException('Failed to create channel');
    await this.gateway.joinChannel(
      creator.intraLogin,
      createdChannel.id.toString(),
    );
    this.gateway.server
      .to(createdChannel.id.toString())
      .emit('createdChannel', createdChannel);
    return createdChannel;
  }

  async getJoinedChannels(user: User) {
    const joinedChannels = await this.prisma.channels.findMany({
      where: {
        members: {
          some: {
            intraLogin: user.intraLogin,
          },
        },
        type: channelType['Channel'],
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        password: false,
        access: true,
        ownerLogin: true,
        bannedUsers: true,
        type: true,
        admins: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
        members: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
      },
    });
    if (!joinedChannels) throw new NotFoundException('no channel found');
    return joinedChannels;
  }

  async getDMS(user: User) {
    var  joinedChannels = await this.prisma.channels.findMany({
      where: {
        members: {
          some: {
            intraLogin: user.intraLogin,
          },
        },
        type: channelType['DM'],
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        password: false,
        type: true,
        members: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
      },
    });
    const currUser = await this.prisma.user.findUnique({
      where:{
        id : user.id,
      },
      include: {
        blocked: true,
        blockedOf: true,
      }
    });
    for (let i = 0; i < joinedChannels.length; i++)
      joinedChannels[i].title = joinedChannels[i].title.replace(
        user.intraLogin,
        '',
      );
    joinedChannels = joinedChannels.filter(
      (channel)=> !currUser.blocked.some(
        (blocked)=> blocked.intraLogin == channel.title) 
        && !currUser.blockedOf.some((blockedOf)=> blockedOf.intraLogin == channel.title));
    return joinedChannels;
  }

  async getChannels(channel: string) {
    if (!channel)
      throw new UnsupportedMediaTypeException('channel name must be suplied');
    const channels = await this.prisma.channels.findMany({
      where: {
        title: {
          contains: channel,
        },
        type: channelType['Channel'],
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        password: false,
        access: true,
        type: true,
        ownerLogin: true,
        bannedUsers: true,
        admins: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
        members: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
      },
    });
    if (!channels || channel.length)
      throw new NotFoundException('no channel found');
    return channels;
  }

  async getChannelById(channelId: number) {
    const channel = await this.prisma.channels.findUnique({
      where: {
        id: channelId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        password: false,
        access: true,
        ownerLogin: true,
        bannedUsers: true,
        type: true,
        admins: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
        members: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
      },
    });
    if (!channel) throw new NotFoundException('no channel found');
    return channel;
  }

  async joinChannel(user: User, channel: number, password?: string) {
    const currChannel = await await this.prisma.channels.findUnique({
      where: {
        id: channel,
      },
      select: {
        password: true,
        access: true,
        bannedUsers: true,
        admins: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
        members: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
        type: true,
      },
    });
    if (!currChannel) throw new NotFoundException('Channel not found');
    if (currChannel.type == channelType['DM'])
      throw new ForbiddenException('channel is a DM');
    if (
      currChannel.access == accessType['Protected'] &&
      (!password || !(await argon2.verify(currChannel.password, password)))
    )
      throw new ForbiddenException(
        'password must be provided for protected channel',
      );
    if (currChannel.access == accessType['Private'])
      throw new ForbiddenException('channel is private');
    if (
      currChannel.members.some((member) => member.intraLogin == user.intraLogin)
    )
      throw new ForbiddenException('you are already member of this channel');
    if (
      currChannel.bannedUsers.some(
        (bannedUser) => bannedUser == user.intraLogin,
      )
    )
      throw new ForbiddenException('you are banned from this channel');
    const createdChannel = await this.prisma.channels.update({
      where: {
        id: channel as number,
      },
      data: {
        members: { connect: { intraLogin: user.intraLogin } },
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        password: false,
        access: true,
        type: true,
        ownerLogin: true,
        bannedUsers: true,
        admins: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
        members: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
      },
    });
    if (!createdChannel) throw new ForbiddenException('Failed to join channel');
    await this.gateway.joinChannel(user.intraLogin, channel.toString());
    delete user.twoFaSecret;
    delete user.TFA;
    delete user.score;
    this.gateway.server
      .to(channel.toString())
      .emit('joinedChannel', { joinedChannel: createdChannel, newUser: user });
    return createdChannel;
  }

  async safeLeaveChannel(user: User, channel: number) {
    return this.prisma.$transaction(async () => {
      return this.leaveChannel(user, channel);
    });
  }

  async leaveChannel(user: User, channel: number, delegate?: string) {
    const currChannel = await this.prisma.channels.findUnique({
      where: {
        id: channel,
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        password: false,
        access: true,
        type: true,
        ownerLogin: true,
        bannedUsers: true,
        admins: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
        members: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
      },
    });
    if (!currChannel) throw new NotFoundException('Channel not found');
    if (currChannel.type == channelType['DM'])
      throw new ForbiddenException('channel is a DM');
    if (
      !currChannel.members.some(
        (member) => member.intraLogin == user.intraLogin,
      )
    )
      throw new ForbiddenException('you are not member of this channel');
    if (currChannel.members.length == 1) {
      let deletedChannel = await this.prisma.channels.update({
        where: {
          id: currChannel.id,
        },
        data: {
          members: { disconnect: { intraLogin: user.intraLogin } },
          admins: { disconnect: { intraLogin: user.intraLogin } },
        },
      });
      await this.prisma.message.deleteMany({
        where: {
          channelId: currChannel.id,
        },
      });
      await this.prisma.channels.delete({ where: { id: currChannel.id } });
      delete user.twoFaSecret;
      delete user.score;
      this.gateway.leaveChannel(user.intraLogin, channel.toString());
      this.gateway.server.to(user.intraLogin).emit('leftChannel', {targetChannel: deletedChannel, leavingUser: user.intraLogin});
      return user;
    }

    if (user.intraLogin == currChannel.ownerLogin) {
      if (currChannel.admins.length > 1) {
        if (currChannel.admins[0].intraLogin == user.intraLogin)
          var newOwner = currChannel.admins[1].intraLogin;
        else var newOwner = currChannel.admins[0].intraLogin;
        const createdChannel = await this.prisma.channels.update({
          where: {
            id: currChannel.id,
          },
          data: {
            ownerLogin: newOwner,
            admins: { disconnect: { intraLogin: user.intraLogin } },
          },
          select: {
            id: true,
            title: true,
            description: true,
            createdAt: true,
            password: false,
            access: true,
            type: true,
            ownerLogin: true,
            bannedUsers: true,
            admins: {
              select: {
                twoFaSecret: false,
                TFA: false,
                intraLogin: true,
                nickname: true,
                avatarLink: true,
                status: true,
              },
            },
            members: {
              select: {
                twoFaSecret: false,
                TFA: false,
                intraLogin: true,
                nickname: true,
                avatarLink: true,
                status: true,
              },
            },
          },
        });
        if (!createdChannel)
          throw new ForbiddenException('failed to assign a new owner');
        this.gateway.leaveChannel(user.intraLogin, channel.toString());
        this.gateway.server
          .to(channel.toString())
          .emit('newOwner', {createdChannel, newOwner});
      } else {
        if (currChannel.members[0].intraLogin == user.intraLogin)
          var newOwner = currChannel.members[1].intraLogin;
        else var newOwner = currChannel.members[0].intraLogin;
        const createdChannel = await this.prisma.channels.update({
          where: {
            id: currChannel.id,
          },
          data: {
            ownerLogin: newOwner,
            admins: { connect: { intraLogin: newOwner } },
          },
          select: {
            id: true,
            title: true,
            description: true,
            createdAt: true,
            password: false,
            access: true,
            type: true,
            ownerLogin: true,
            bannedUsers: true,
            admins: {
              select: {
                twoFaSecret: false,
                TFA: false,
                intraLogin: true,
                nickname: true,
                avatarLink: true,
                status: true,
              },
            },
            members: {
              select: {
                twoFaSecret: false,
                TFA: false,
                intraLogin: true,
                nickname: true,
                avatarLink: true,
                status: true,
              },
            },
          },
        });
        if (!createdChannel)
          throw new ForbiddenException('failed to assign a new owner');
        this.gateway.leaveChannel(user.intraLogin, channel.toString());
        this.gateway.server
          .to(channel.toString())
          .emit('newOwner', { createdChannel, newOwner });
      }
    }

    if (currChannel.admins.some((admin) => admin.intraLogin == user.intraLogin))
      await this.prisma.channels.update({
        where: {
          id: currChannel.id,
        },
        data: {
          admins: { disconnect: { intraLogin: user.intraLogin } },
        },
      });
    const createdChannel = await this.prisma.channels.update({
      where: {
        id: currChannel.id,
      },
      data: {
        members: { disconnect: { intraLogin: user.intraLogin } },
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        password: false,
        access: true,
        type: true,
        ownerLogin: true,
        bannedUsers: true,
        admins: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
        members: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
      },
    });
    if (!createdChannel) throw new ForbiddenException('something went wrong');
    await this.gateway.leaveChannel(user.intraLogin, channel.toString());
    delete user.twoFaSecret;
    delete user.TFA;
    this.gateway.server.to(channel.toString()).emit('leftChannel', {
      targetChannel: createdChannel,
      leavingUser: user.intraLogin,
    });
    this.gateway.server.to(user.intraLogin).emit('leftChannel', {
      targetChannel: createdChannel,
      leavingUser: user.intraLogin,
    });
    return createdChannel;
  }

  async inviteMember(user: User, channel: number, invitedLogin: string) {
    const currChannel = await this.prisma.channels.findUnique({
      where: {
        id: channel,
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        password: false,
        access: true,
        bannedUsers: true,
        admins: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
        members: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
        type: true,
      },
    });
    if (!currChannel) throw new NotFoundException('Channel not found');
    if (currChannel.type == channelType['DM'])
      throw new ForbiddenException('channel is a DM');
    if (
      !currChannel.members.some(
        (member) => member.intraLogin == user.intraLogin,
      )
    )
      throw new ForbiddenException('you are not member of this channel');
    if (currChannel.members.some((member) => member.intraLogin == invitedLogin))
      throw new ForbiddenException('user already member of this channel');
    if (
      currChannel.bannedUsers.some((bannedUser) => bannedUser == invitedLogin)
    )
      throw new ForbiddenException('user is banned from this channel');
    if (
      (currChannel.access === accessType['Private'] ||
        currChannel.access === accessType['Protected']) &&
      !currChannel.admins.some((admins) => admins.intraLogin == user.intraLogin)
    )
      throw new ForbiddenException(
        'you dont have permission to add users to this channel',
      );
    const invited = await this.prisma.user.findUnique({
      where: { intraLogin: invitedLogin },
      select: {
        intraLogin: true,
        nickname: true,
        avatarLink: true,
      },
    });
    if (!invited) throw new NotFoundException('user not found');
    if (!invited.nickname) throw new ForbiddenException("nickname is required for this route")
    const createdChannel = await this.prisma.channels.update({
      where: {
        id: channel,
      },
      data: {
        members: { connect: { intraLogin: invitedLogin } },
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        password: false,
        access: true,
        type: true,
        ownerLogin: true,
        bannedUsers: true,
        admins: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
        members: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
      },
    });
    await this.gateway.joinChannel(invited.intraLogin, channel.toString());
    this.gateway.server.to(channel.toString()).emit('joinedChannel', {
      joinedChannel: createdChannel,
      newUser: invited,
    });
    return createdChannel;
  }

  async kickMember(user: User, channel: number, kickedLogin: string) {
    let createdChannel;
    const currChannel = await this.prisma.channels.findUnique({
      where: {
        id: channel,
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        password: false,
        access: true,
        bannedUsers: true,
        admins: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
        members: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
        ownerLogin: true,
        type: true,
      },
    });
    if (!currChannel) throw new NotFoundException('Channel not found');
    if (currChannel.type == channelType['DM'])
      throw new ForbiddenException('channel is a DM');
    if (
      !currChannel.members.some(
        (member) => member.intraLogin == user.intraLogin,
      )
    )
      throw new ForbiddenException('you are not member of this channel');
    if (!currChannel.members.some((member) => member.intraLogin == kickedLogin))
      throw new ForbiddenException('user not member of this channel');
    if (
      !currChannel.admins.some((admins) => admins.intraLogin == user.intraLogin)
    )
      throw new ForbiddenException(
        'you dont have permission to kick users from this channel',
      );
    if (
      !(await this.prisma.user.findUnique({
        where: { intraLogin: kickedLogin },
      }))
    )
      throw new NotFoundException('user not found');
    if (currChannel.ownerLogin == kickedLogin)
      throw new ForbiddenException('can not kick owner');
    if (currChannel.admins.some((admins) => admins.intraLogin == kickedLogin))
      createdChannel = await this.prisma.channels.update({
        where: {
          id: channel,
        },
        data: {
          members: { disconnect: { intraLogin: kickedLogin } },
          admins: { disconnect: { intraLogin: kickedLogin } },
        },
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          password: false,
          access: true,
          type: true,
          ownerLogin: true,
          bannedUsers: true,
          admins: {
            select: {
              twoFaSecret: false,
              TFA: false,
              intraLogin: true,
              nickname: true,
              avatarLink: true,
              status: true,
            },
          },
          members: {
            select: {
              twoFaSecret: false,
              TFA: false,
              intraLogin: true,
              nickname: true,
              avatarLink: true,
              status: true,
            },
          },
        },
      });
    else
      createdChannel = await this.prisma.channels.update({
        where: {
          id: channel,
        },
        data: {
          members: { disconnect: { intraLogin: kickedLogin } },
        },
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          password: false,
          access: true,
          type: true,
          ownerLogin: true,
          bannedUsers: true,
          admins: {
            select: {
              twoFaSecret: false,
              TFA: false,
              intraLogin: true,
              nickname: true,
              avatarLink: true,
              status: true,
            },
          },
          members: {
            select: {
              twoFaSecret: false,
              TFA: false,
              intraLogin: true,
              nickname: true,
              avatarLink: true,
              status: true,
            },
          },
        },
      });
    await this.gateway.leaveChannel(kickedLogin, channel.toString());
    this.gateway.server.to(channel.toString()).emit('leftChannel', {
      targetChannel: createdChannel,
      leavingUser: kickedLogin,
    });
    this.gateway.server.to(kickedLogin).emit('leftChannel', {
      targetChannel: createdChannel,
      leavingUser: kickedLogin,
    });
    return createdChannel;
  }

  async banMember(user: User, channel: number, bannedLogin: string) {
    let createdChannel;
    const currChannel = await this.prisma.channels.findUnique({
      where: {
        id: channel,
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        password: false,
        access: true,
        bannedUsers: true,
        admins: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
        members: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
        ownerLogin: true,
        type: true,
      },
    });
    if (!currChannel) throw new NotFoundException('Channel not found');
    if (currChannel.type == channelType['DM'])
      throw new ForbiddenException('channel is a DM');
    if (
      !currChannel.members.some(
        (member) => member.intraLogin == user.intraLogin,
      )
    )
      throw new ForbiddenException('you are not member of this channel');
    if (
      !currChannel.admins.some((admins) => admins.intraLogin == user.intraLogin)
    )
      throw new ForbiddenException(
        'you dont have permission to ban users from this channel',
      );
    const bannedUser = (await this.prisma.user.findUnique({
      where: { intraLogin: bannedLogin },
    }))
    if (!bannedUser)
      throw new NotFoundException('user not found');
    if (!bannedUser.nickname)
      throw new ForbiddenException('nickname is required for this route')
    if (currChannel.bannedUsers.some((bannedUser) => bannedUser == bannedLogin))
      throw new ForbiddenException('user already banned from this channel');
    if (currChannel.ownerLogin == bannedLogin)
      throw new ForbiddenException('can not ban owner');
    if (!currChannel.members.some((member) => member.intraLogin == bannedLogin))
      createdChannel = await this.prisma.channels.update({
        where: {
          id: channel,
        },
        data: {
          bannedUsers: { push: bannedLogin },
        },
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          password: false,
          access: true,
          type: true,
          ownerLogin: true,
          bannedUsers: true,
          admins: {
            select: {
              twoFaSecret: false,
              TFA: false,
              intraLogin: true,
              nickname: true,
              avatarLink: true,
              status: true,
            },
          },
          members: {
            select: {
              twoFaSecret: false,
              TFA: false,
              intraLogin: true,
              nickname: true,
              avatarLink: true,
              status: true,
            },
          },
        },
      });
    else
      createdChannel = await this.prisma.channels.update({
        where: {
          id: channel,
        },
        data: {
          members: { disconnect: { intraLogin: bannedLogin } },
          bannedUsers: { push: bannedLogin },
        },
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          password: false,
          access: true,
          type: true,
          ownerLogin: true,
          bannedUsers: true,
          admins: {
            select: {
              twoFaSecret: false,
              TFA: false,
              intraLogin: true,
              nickname: true,
              avatarLink: true,
              status: true,
            },
          },
          members: {
            select: {
              twoFaSecret: false,
              TFA: false,
              intraLogin: true,
              nickname: true,
              avatarLink: true,
              status: true,
            },
          },
        },
      });
    await this.gateway.leaveChannel(bannedLogin, channel.toString());
    this.gateway.server.to(bannedLogin).emit('leftChannel', {
      targetChannel: createdChannel,
      leavingUser: bannedLogin,
    });
    this.gateway.server.to(channel.toString()).emit('leftChannel', {
      targetChannel: createdChannel,
      leavingUser: bannedLogin,
    });
    return createdChannel;
  }

  async unban(user: User, channel: number, toUnban: string) {
    const currChannel = await this.prisma.channels.findUnique({
      where: {
        id: channel,
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        password: false,
        access: true,
        ownerLogin: true,
        bannedUsers: true,
        admins: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
        members: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true
          },
        },
        type: true,
      },
    });
    if (!currChannel) throw new NotFoundException('Channel not found');
    if (currChannel.type == channelType['DM'])
      throw new ForbiddenException('channel is a DM');
    if (
      !currChannel.members.some(
        (member) => member.intraLogin == user.intraLogin,
      )
    )
      throw new ForbiddenException('you are not member of this channel');
    if (
      !currChannel.admins.some((admins) => admins.intraLogin == user.intraLogin)
    )
      throw new ForbiddenException(
        'you dont have permission to unban users from this channel',
      );
    if (
      !(await this.prisma.user.findUnique({ where: { intraLogin: toUnban } }))
    )
      throw new NotFoundException('user not found');
    if (!currChannel.bannedUsers.some((bannedUser) => bannedUser == toUnban))
      throw new ForbiddenException('user is not banned from this channel');
    const createdChannel = await this.prisma.channels.update({
      where: {
        id: channel,
      },
      data: {
        bannedUsers: {
          set: currChannel.bannedUsers.filter(
            (bannedUser) => bannedUser != toUnban,
          ),
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        password: false,
        access: true,
        type: true,
        ownerLogin: true,
        bannedUsers: true,
        admins: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
        members: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
      },
    });
    this.gateway.server
      .to(toUnban)
      .emit('unban', { targetChannel: createdChannel, toUnban });
    this.gateway.server
      .to(channel.toString())
      .emit('unban', { targetChannel: createdChannel, toUnban });
    return createdChannel;
  }

  async giveAdmin(user: User, channel: number, newAdmin: string) {
    const currChannel = await this.prisma.channels.findUnique({
      where: {
        id: channel,
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        password: false,
        access: true,
        ownerLogin: true,
        bannedUsers: true,
        admins: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
        members: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
        type: true,
      },
    });
    if (!currChannel) throw new NotFoundException('Channel not found');
    if (currChannel.type == channelType['DM'])
      throw new ForbiddenException('channel is a DM');
    if (
      !currChannel.members.some(
        (member) => member.intraLogin == user.intraLogin,
      )
    )
      throw new ForbiddenException('you are not member of this channel');
    if (!currChannel.members.some((member) => member.intraLogin == newAdmin))
      throw new ForbiddenException(
        'can only give admin access to members of this channel',
      );
    if (
      !currChannel.admins.some((admins) => admins.intraLogin == user.intraLogin)
    )
      throw new ForbiddenException(
        'you dont have permission to give admin rights',
      );
    if (
      !(await this.prisma.user.findUnique({ where: { intraLogin: newAdmin } }))
    )
      throw new NotFoundException('user not found');
    if (currChannel.admins.some((admins) => admins.intraLogin == newAdmin))
      throw new ForbiddenException('user already admin of this channel');
    const createdChannel = await this.prisma.channels.update({
      where: {
        id: channel,
      },
      data: {
        admins: { connect: { intraLogin: newAdmin } },
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        password: false,
        access: true,
        type: true,
        ownerLogin: true,
        bannedUsers: true,
        admins: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
        members: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
      },
    });
    this.gateway.server
      .to(createdChannel.id.toString())
      .emit('newAdmin', { targetChannel: createdChannel, newAdmin });
    return createdChannel;
  }

  async findNonJoinedPublicChannels(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        joinedChannels: true,
      },
    });
    const joinedChannelIds = user.joinedChannels.map((channel) => channel.id);

    const publicChannels = await this.prisma.channels.findMany({
      where: {
        access: accessType['Public'],
        type: channelType['Channel'],
        id: {
          notIn: joinedChannelIds,
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        password: false,
        access: true,
        type: true,
        bannedUsers: true,
        ownerLogin: true,
        admins: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
        members: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
      },
    });
    return publicChannels;
  }

  async findNonJoinedProtectedChannels(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        joinedChannels: true,
      },
    });
    const joinedChannelIds = user.joinedChannels.map((channel) => channel.id);

    const protectedChannels = await this.prisma.channels.findMany({
      where: {
        access: accessType['Protected'],
        type: channelType['Channel'],
        id: {
          notIn: joinedChannelIds,
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        password: false,
        access: true,
        type: true,
        bannedUsers: true,
        ownerLogin: true,
        admins: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
        members: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
      },
    });
    return protectedChannels;
  }

  async allPublic() {
    const publicChannels = await this.prisma.channels.findMany({
      where: {
        access: accessType['Public'],
        type: channelType['Channel'],
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        password: false,
        access: true,
        type: true,
        bannedUsers: true,
        ownerLogin: true,
        admins: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
        members: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
      },
    });
    return publicChannels;
  }

  async allProtected() {
    const protectedChannels = await this.prisma.channels.findMany({
      where: {
        access: accessType['Protected'],
        type: channelType['Channel'],
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        password: false,
        access: true,
        type: true,
        bannedUsers: true,
        ownerLogin: true,
        admins: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
        members: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
      },
    });
    return protectedChannels;
  }

  async removeAdmin(user: User, channel: number, toRemove: string)
  {
    const currChannel = await this.prisma.channels.findUnique({
      where:{
        id: channel,
      },
      include:{
        members: {select: {intraLogin: true}},
        admins: {select: {intraLogin: true}},
      }
    });
    if(!currChannel) throw new NotFoundException('Channel not found');
    if(currChannel.type == channelType['DM']) throw new ForbiddenException('channel is a DM');
    if(!currChannel.members.some(member => member.intraLogin == user.intraLogin)) throw new ForbiddenException('you are not member of this channel');
    if(!currChannel.admins.some(admin => admin.intraLogin == user.intraLogin)) throw new ForbiddenException('you dont have permission to remove admins');
    if(!currChannel.admins.some(admin => admin.intraLogin == toRemove)) throw new ForbiddenException('user is not admin of this channel');
    if(currChannel.ownerLogin == toRemove) throw new ForbiddenException('can not remove owner');
    if(currChannel.admins.some(admin => admin.intraLogin == toRemove) && user.intraLogin != currChannel.ownerLogin) throw new ForbiddenException('you dont have permission to remove this admin');
    const createdChannel = await this.prisma.channels.update({
      where:{
        id: channel,
      },
      data:{
        admins: {disconnect: {intraLogin: toRemove}}
      },
      select:{
        id: true,
        title: true,
        description: true,
        createdAt: true,
        password: false,
        access: true,
        type: true,
        ownerLogin: true,
        bannedUsers: true,
        admins: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
        members: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
      },
    });
    if (!createdChannel)
      throw new ForbiddenException("Something went wrong");
    this.gateway.server.to(channel.toString()).emit('removeAdmin', {targetChannel: createdChannel, toRemove});
    this.gateway.server.to(toRemove).emit('removeAdmin', {targetChannel: createdChannel, toRemove});
    return createdChannel;
  }

  async startDM(user: User, friend: string) {
    const friendUser = await this.prisma.user.findUnique({
      where: {
        intraLogin: friend,
      },
      select: {
        id: true,
        nickname: true,
        avatarLink: true,
        TFA: true,
        twoFaSecret: true,
        joinedChannels: true,
        friends: true,
        blocked: true,
        blockedOf: true,
        status: true,
      },
    });
    if (!friendUser) throw new NotFoundException('user not found');
    if (
      friendUser.blocked.some(
        (blockedUser) => blockedUser.intraLogin == user.intraLogin,
      ) ||
      friendUser.blockedOf.some(
        (blockedUser) => blockedUser.intraLogin == user.intraLogin,
      )
    )
      throw new ForbiddenException('you are blocked by this user');
    if (
      friendUser.friends.some((friend) => friend.intraLogin == user.intraLogin)
    ) {
      const channel = await this.prisma.channels.findFirst({
        where: {
          type: channelType['DM'],
          members: {
            every: {
              intraLogin: {
                in: [user.intraLogin, friend],
              },
            },
          },
        },
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          password: false,
          access: true,
          type: true,
          bannedUsers: true,
          ownerLogin: true,
          admins: {
            select: {
              twoFaSecret: false,
              TFA: false,
              intraLogin: true,
              nickname: true,
              avatarLink: true,
              status: true,
            },
          },
          members: {
            select: {
              twoFaSecret: false,
              TFA: false,
              intraLogin: true,
              nickname: true,
              avatarLink: true,
              status: true,
            },
          },
        },
      });
      if (channel)
        throw new ForbiddenException(
          'DM channel with this user already exists',
        );
      const createdChannel = await this.prisma.channels.create({
        data: {
          title: friend + user.intraLogin,
          description: null,
          password: null,
          access: accessType['Private'],
          type: channelType['DM'],
          members: {
            connect: [{ intraLogin: user.intraLogin }, { intraLogin: friend }],
          },
        },
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          password: false,
          access: true,
          type: true,
          ownerLogin: true,
          bannedUsers: true,
          admins: {
            select: {
              twoFaSecret: false,
              TFA: false,
              intraLogin: true,
              nickname: true,
              avatarLink: true,
              status: true,
            },
          },
          members: {
            select: {
              twoFaSecret: false,
              TFA: false,
              intraLogin: true,
              nickname: true,
              avatarLink: true,
              status: true,
            },
          },
        },
      });
      await this.gateway.joinChannel(
        user.intraLogin,
        createdChannel.id.toString(),
        );
        await this.gateway.joinChannel(friend, createdChannel.id.toString());
        let userDm:Channel = new Channel(createdChannel);
        let friendDm:Channel = new Channel(createdChannel);
        userDm.title = userDm.title.replace(user.intraLogin, '');
        friendDm.title = friendDm.title.replace(friend, '');
        await this.gateway.server.to(user.intraLogin).emit('startDM', {joinedChannel: userDm});
        await this.gateway.server.to(friend).emit('startDM', {joinedChannel: friendDm});
      createdChannel.title = createdChannel.title.replace(user.intraLogin, '');
      return createdChannel;
    }
    throw new ForbiddenException('you are not friends with this user');
  }

  async chmod(user: User, channel: number, access: number, password?: string) {
    const currChannel = await this.prisma.channels.findUnique({
      where: {
        id: channel,
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        password: false,
        access: true,
        type: true,
        ownerLogin: true,
        bannedUsers: true,
        admins: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
        members: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
      },
    });
    if (!currChannel) throw new NotFoundException('Channel not found');
    if (currChannel.type == channelType['DM'])
      throw new ForbiddenException('channel is a DM');
    if (
      !currChannel.members.some(
        (member) => member.intraLogin == user.intraLogin,
      )
    )
      throw new ForbiddenException('you are not member of this channel');
    if (currChannel.ownerLogin !== user.intraLogin)
      throw new ForbiddenException(
        'you dont have permission to change channel access',
      );
    if (currChannel.access == accessType['Private'] && access == 1)
      throw new ForbiddenException('channel is already private');
    if (currChannel.access == accessType['Public'] && access == 3)
      throw new ForbiddenException('channel is already public');
    let newAccess;
    if (access == 1) newAccess = accessType['Private'];
    else if (access == 2) {
      if (!password || password.length < 8)
        throw new ForbiddenException(
          'password must be provided for protected channel and must be at least 8 characters long',
        );
      newAccess = accessType['Protected'];
    } else if (access == 3) newAccess = accessType['Public'];
    else throw new ForbiddenException('invalid access type');
    const createdChannel = await this.prisma.channels.update({
      where: {
        id: channel,
      },
      data: {
        access: newAccess,
        password: access == 2 ? await argon2.hash(password) : null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        password: false,
        access: true,
        type: true,
        ownerLogin: true,
        bannedUsers: true,
        admins: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
        members: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
      },
    });
    this.gateway.server.to(channel.toString()).emit('chmod', createdChannel);
    return createdChannel;
  }

  async changeTitle(user: User, channel: number, title: string) {
    const currChannel = await this.prisma.channels.findUnique({
      where: {
        id: channel,
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        password: false,
        access: true,
        type: true,
        ownerLogin: true,
        bannedUsers: true,
        admins: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
        members: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
      },
    });
    if (!currChannel) throw new NotFoundException('Channel not found');
    if (currChannel.type == channelType['DM'])
      throw new ForbiddenException('channel is a DM');
    if (
      !currChannel.members.some(
        (member) => member.intraLogin == user.intraLogin,
      )
    )
      throw new ForbiddenException('you are not member of this channel');
    if (currChannel.ownerLogin != user.intraLogin)
      throw new ForbiddenException(
        'you dont have permission to change channel title',
      );
    if (title.length < 3)
      throw new ForbiddenException('title must be at least 3 characters long');
    const createdChannel = await this.prisma.channels.update({
      where: {
        id: channel,
      },
      data: {
        title: title,
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        password: false,
        access: true,
        type: true,
        ownerLogin: true,
        bannedUsers: true,
        admins: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
        members: {
          select: {
            twoFaSecret: false,
            TFA: false,
            intraLogin: true,
            nickname: true,
            avatarLink: true,
            status: true,
          },
        },
      },
    });
    this.gateway.server
      .to(channel.toString())
      .emit('changeTitle', createdChannel);
    return createdChannel;
  }
}
