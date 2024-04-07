import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { ChannelDto } from './dto';
import { JwtGuard } from 'src/auth/guards';
import { ViewAuthFilter } from 'src/auth/filters/auth.filter';
import { ChannelService } from './channel.service';
import { use } from 'passport';

@UseGuards(JwtGuard)
@Controller('/channel')
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @Get('allNonJoinedPublic')
  async getNonJoinPublic(@GetUser() user: User) {
    if (!user.nickname)
      throw new ForbiddenException('nickname is required for this route');
    return this.channelService.findNonJoinedPublicChannels(user.id);
  }

  @Get('allNonJoinedProtected')
  getNonJoinProtected(@GetUser() user: User) {
    if (!user.nickname)
      throw new ForbiddenException('nickname is required for this route');
    return this.channelService.findNonJoinedProtectedChannels(user.id);
  }

  @Post('create')
  createChannel(@GetUser() user: User, @Body() bod) {
    if (!user.nickname)
      throw new ForbiddenException('nickname is required for this route');
    const channel: ChannelDto = bod;
    return this.channelService.createChannel(user, channel);
  }
  @Get('public')
  getPublic(@GetUser() user: User){
    if (!user.nickname)
      throw new ForbiddenException('nickname is required for this route');
    return this.channelService.allPublic();
  }
  @Get('protected')
  getProtected(@GetUser() user: User) {
    if (!user.nickname)
      throw new ForbiddenException('nickname is required for this route');
    return this.channelService.allProtected();
  }
  @Get('all')
  getChannels(@GetUser() user: User, @Body() bod) {
    if (!user.nickname)
      throw new ForbiddenException('nickname is required for this route');
    return this.channelService.getChannels(bod.channel);
  }
  @Get('/joinedChannels')
  getJoinedChannels(@GetUser() user: User) {
    if (!user.nickname)
      throw new ForbiddenException('nickname is required for this route');
    return this.channelService.getJoinedChannels(user);
  }

  @Get('/alldms')
  getDMs(@GetUser() user: User) {
    if (!user.nickname)
      throw new ForbiddenException('nickname is required for this route');
    return this.channelService.getDMS(user);
  }

  @Get('/:channel')
  getChannelById(@GetUser() user: User ,@Param('channel') channel) {
    if (!user.nickname)
      throw new ForbiddenException('nickname is required for this route');
    try {
      const id = parseInt(channel, 10);
      if (isNaN(id)) throw new ForbiddenException(`Invalid channel`);
      return this.channelService.getChannelById(id);
    } catch (e) {
      throw new ForbiddenException('must provide a valid channel id');
    }
  }
  @Post('/join')
  joinChannel(@Body() channel, @GetUser() user: User) {
    if (!user.nickname)
      throw new ForbiddenException('nickname is required for this route');
    try {
      const id = parseInt(channel.channel, 10);
      if (isNaN(id)) throw new Error(`Invalid channel`);
      return this.channelService.joinChannel(
        user,
        id,
        channel.password ? channel.password : null,
      );
    } catch (Error) {
      throw new ForbiddenException('must provide a valid channel id');
    }
  }
  @Post('/leave')
  leaveChannel(@Body() channel, @GetUser() user: User) {
    if (!user.nickname)
      throw new ForbiddenException('nickname is required for this route');
    try {
      const id = parseInt(channel.channel, 10);
      if (isNaN(id)) throw new Error(`Invalid channel`);
      return this.channelService.leaveChannel(user, id);
    } catch (Error) {
      throw new ForbiddenException('must provide a valid channel id');
    }
  }

  @Post('/invite')
  inviteUser(@Body() channel, @GetUser() user: User) {
    if (!user.nickname)
      throw new ForbiddenException('nickname is required for this route');
    try {
      const id = parseInt(channel.channel, 10);
      if (isNaN(id)) throw new Error(`Invalid channel`);
      if (!channel.user) throw new Error(`Invalid user`);
      return this.channelService.inviteMember(user, id, channel.user);
    } catch (Error) {
      throw new ForbiddenException(
        'must provide a valid channel id, and a valid user',
      );
    }
  }
  @Post('/kick')
  kickUser(@Body() channel, @GetUser() user: User) {
    if (!user.nickname)
      throw new ForbiddenException('nickname is required for this route');
    try {
      const id = parseInt(channel.channel, 10);
      if (isNaN(id)) throw new Error(`Invalid channel`);
      if (!channel.user) throw new Error(`Invalid user`);
      return this.channelService.kickMember(user, id, channel.user);
    } catch (Error) {
      throw new ForbiddenException(
        'must provide a valid channel id, and a valid user',
      );
    }
  }
  @Post('/ban')
  banUser(@Body() channel, @GetUser() user: User) {
    if (!user.nickname)
      throw new ForbiddenException('nickname is required for this route');
    try {
      const id = parseInt(channel.channel, 10);
      if (isNaN(id)) throw new Error(`Invalid channel`);
      if (!channel.user) throw new Error(`Invalid user`);
      return this.channelService.banMember(user, id, channel.user);
    } catch (Error) {
      throw new ForbiddenException(
        'must provide a valid channel id, and a valid user',
      );
    }
  }
  @Post('/unban')
  unbanUser(@Body() channel, @GetUser() user: User) {
    if (!user.nickname)
      throw new ForbiddenException('nickname is required for this route');
    try {
      const id = parseInt(channel.channel, 10);
      if (isNaN(id)) throw new Error(`Invalid channel`);
      if (!channel.user) throw new Error(`Invalid user`);
      return this.channelService.unban(user, id, channel.user);
    } catch (Error) {
      throw new ForbiddenException(
        'must provide a valid channel id, and a valid user',
      );
    }
  }
  @Post('/newAdmin')
  newAdmin(@Body() channel, @GetUser() user: User) {
    if (!user.nickname)
      throw new ForbiddenException('nickname is required for this route');
    try {
      const id = parseInt(channel.channel, 10);
      if (isNaN(id)) throw new Error(`Invalid channel`);
      if (!channel.user) throw new Error(`Invalid user`);
      return this.channelService.giveAdmin(user, id, channel.user);
    } catch (Error) {
      throw new ForbiddenException(
        'must provide a valid channel id, and a valid user',
      );
    }
  }
  @Post('/removeAdmin')
  removeAdmin(@Body() channel, @GetUser() user: User) {
    if (!user.nickname)
      throw new ForbiddenException('nickname is required for this route');
    try {
      const id = parseInt(channel.channel, 10);
      if (isNaN(id)) throw new Error(`Invalid channel`);
      if (!channel.user) throw new Error(`Invalid user`);
      return this.channelService.removeAdmin(user, id, channel.user);
    } catch (Error) {
      throw new ForbiddenException(
        'must provide a valid channel id, and a valid user',
      );
    }
  }
  @Post('/newDM')
  newDM(@Body() channel, @GetUser() user: User) {
    if (!user.nickname)
      throw new ForbiddenException('nickname is required for this route');
    try {
      if (!channel.user) throw new Error(`Invalid user`);
      return this.channelService.startDM(user, channel.user);
    } catch (Error) {
      throw new ForbiddenException('must provide a valid user');
    }
  }
  @Post('/chmod')
  chmod(@Body() channel, @GetUser() user: User) {
    if (!user.nickname)
      throw new ForbiddenException('nickname is required for this route');
    try {
      const id = parseInt(channel.channel, 10);
      const access = parseInt(channel.access, 10);
      if (isNaN(id)) throw new Error(`Invalid channel`);
      if (isNaN(access)) throw new Error(`Invalid access`);
      return this.channelService.chmod(user, id, access, channel.password?channel.password:null);
    } catch (Error) {
      throw new ForbiddenException(
        'must provide a valid channel id, and a valid user, and a valid access',
      );
    }
  }

  @Post('/changeTitle')
  changeTitle(@Body() channel, @GetUser() user: User) {
    if (!user.nickname)
      throw new ForbiddenException('nickname is required for this route');
    try {
      const id = parseInt(channel.channel, 10);
      if (isNaN(id)) throw new Error(`Invalid channel`);
      if (!channel.title || channel.title.length < 3)
        throw new Error(`Invalid title`);
      return this.channelService.changeTitle(user, id, channel.title);
    } catch (Error) {
      throw new ForbiddenException(
        'must provide a valid channel id, and a valid title',
      );
    }
  }
}


