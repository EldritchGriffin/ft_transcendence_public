import { ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException, UnsupportedMediaTypeException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User, channelType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as cloudinary from 'cloudinary';
import * as fs from 'fs';
import { authenticator } from 'otplib';
import {toDataURL} from 'qrcode';
import { ChannelGateway } from 'src/channel/channel.gateway';
import { accessType } from 'src/channel/channel.service';

@Injectable()
export class UserService 
{
    constructor(private prisma : PrismaService,
                private readonly configService: ConfigService,
                private gateway : ChannelGateway)
    {
        cloudinary.v2.config({
            cloud_name: configService.get<string>('CLOUDINARY_NAME'),
            api_key: configService.get<string>('CLOUDINARY_KEY'),
            api_secret: configService.get<string>('CLOUDINARY_SECRET'),
        });
    }

    async getAllUsers()
    {
        let allUsers = await this.prisma.user.findMany({
            select: {
                intraLogin: true,
                nickname: true,
                avatarLink: true,
                status:true
            }
        });
        return allUsers.filter(user => user.nickname != null);
    }

    async getSelfUserInfo(user : User)
    {
        const currUser = await this.prisma.user.findFirst(
            {
                where: {
                    intraLogin : user.intraLogin,
                },
                select: {
                    intraLogin: true,
                    nickname: true,
                    score: true,
                    TFA: true,
                    matchHistory:{
                        include: {
                            players:{
                                select:{
                                    intraLogin:true,
                                    nickname:true,
                                    avatarLink:true,
                                }
                            }
                        },
                    },
                    friends:{
                        select:{
                            intraLogin:true,
                            nickname:true,
                            avatarLink:true,
                            status:true
                        }
                    },
                    requested:{
                        select:{
                            intraLogin:true,
                            nickname:true,
                            avatarLink:true,
                            status:true
                        }
                    },
                    requesting:{
                        select:{
                            intraLogin:true,
                            nickname:true,
                            avatarLink:true,
                            status:true
                        }
                    },
                    blocked:{
                        select:{
                            intraLogin:true,
                            nickname:true,
                            avatarLink:true,
                        }
                    },
                    blockedOf:{
                        select:{
                            intraLogin:true,
                            nickname:true,
                            avatarLink:true,
                        }
                    }
                    ,
                    joinedChannels: {
                        where:{
                            type: channelType["Channel"],
                        },
                        select:{
                            id: true,
                            title: true,
                            description: true,
                            createdAt: true,
                            password: false,
                            access: true,
                            admins: {select: {twoFaSecret: false, TFA: false, intraLogin: true, nickname: true, avatarLink: true}},
                            members: {select: {twoFaSecret: false, TFA: false, intraLogin: true, nickname: true, avatarLink: true}},
                            type: true,
                        }
                    },
                    status: true,
                    avatarLink: true,
                    id : false,
                },
            }
        );
        if (!currUser)
            throw new ForbiddenException("something went bad contact sixiecow");
        return currUser
    }

    async getUserInfo(user_:string)
    {
        const currUser = await this.prisma.user.findFirst(
            {
                where: {
                    intraLogin : user_,
                },
                select: {
                    intraLogin: true,
                    nickname: true,
                    score: true,
                    matchHistory:{
                        include: {
                            players:{
                                select:{
                                    intraLogin:true,
                                    nickname:true,
                                    avatarLink:true,
                                }
                            }
                        },
                    },
                    friends:{
                        select:{
                            intraLogin:true,
                            nickname:true,
                            avatarLink:true,
                        }
                    },
                    requested:false, 
                    blocked: false,
                    avatarLink: true,
                    id : false,
                    status: true,
                },
            }
        );
        if (!currUser || currUser.nickname == null)
            throw new NotFoundException("user does not exist");
        return currUser;
    }

    async getBlocked(user:User)
    {
        const blocked = await this.prisma.user.findUnique({
            where:{
                intraLogin: user.intraLogin
            },
            select:{
                blocked:{select: {intraLogin:true, nickname:true, avatarLink:true}},
            },
        });
        return blocked.blocked;
    }

    async isAlreadyFriendsOrRequesting(sender: string, receiverName: string, flag : number): Promise<boolean> {
        let friendExists;
        let requestingE;
        let requestedE;

        const user = await this.prisma.user.findUnique({
          where: { intraLogin: sender },
          include: {
            friends: {
              select: {
                intraLogin: true,
                nickname: true
              },
            },
            requested:{
                select: {
                    intraLogin: true,
                    nickname : true
                }
            },
            requesting:{
                select: {
                    intraLogin: true,
                    nickname: true
                }
            },
            blocked:{
                select: {
                    intraLogin: true,
                    nickname: true
                }
            },
            blockedOf:{
                select: {
                    intraLogin: true,
                    nickname: true
                }
            },
        }
    });
    const isBlocked = user.blocked.some(block => block.intraLogin === receiverName || block.nickname === receiverName)
    const isBlockedOf = user.blockedOf.some(block => block.intraLogin === receiverName || block.nickname === receiverName)
    if (isBlocked || isBlockedOf)
        throw new ForbiddenException("user is blocked");
    if (!user) 
        throw new NotFoundException('User not found');
    if (flag % 2 === 1)
        friendExists = user.friends.some(friend => friend.intraLogin === receiverName || friend.nickname === receiverName);
    if ((flag >> 1) % 2 === 1)
        requestingE = user.requesting.some(requesting => requesting.intraLogin === receiverName || requesting.nickname === receiverName);
    if ((flag >> 2) % 2 === 1)
        requestedE = user.requested.some(requested => requested.intraLogin === receiverName || requested.nickname === receiverName);
    
    return friendExists || requestedE || requestingE;
    }

    async requestFriendship (sender:User, receiverName : string)
    {
        const receiverExists = await this.prisma.user.findUnique({where: {intraLogin: receiverName}});
        let already;
        if (!receiverExists || receiverExists.nickname == null)
            throw new NotFoundException("user does not exist")
        already = await this.isAlreadyFriendsOrRequesting(sender.intraLogin, receiverName, 6)
        if (!already)
        {
            const reciever = await this.prisma.user.update({
                where: {
                    intraLogin : sender.intraLogin
                },
                data:{
                    requesting : {
                        connect : {intraLogin: receiverName},
                    }
                },
                select:
                {
                    intraLogin: true,
                    avatarLink: true,
                    nickname: true,
                    status: true,
                }
            })
            this.gateway.server.to(sender.intraLogin).emit('friendRequest', {sender: {intraLogin: sender.intraLogin, nickname: sender.nickname, avatarLink: sender.avatarLink}, receiver: receiverName});
            this.gateway.server.to(receiverName).emit('friendRequest', {sender: {intraLogin: sender.intraLogin, nickname: sender.nickname, avatarLink: sender.avatarLink}, receiver: receiverName});
            this.gateway.server.to(receiverName).emit('friendRequestNotif', {sender: {intraLogin: sender.intraLogin, nickname: sender.nickname, avatarLink: sender.avatarLink}, receiver: receiverName});
            return reciever;
        }
        else
            throw new ForbiddenException("the user is already requested or requesting or friends");
    }

    async removeFriend(sender : User, receiverName:string)
    {
        const receiverExists = await this.prisma.user.findUnique({where: {intraLogin: receiverName}});
        if (!receiverExists || receiverExists.nickname == null)
            throw new NotFoundException("user does not exist");
        const already = await this.isAlreadyFriendsOrRequesting(sender.intraLogin, receiverName, 1)
        if (already)
        {
            const sender_ = await this.prisma.user.update({
                where: {
                    intraLogin : sender.intraLogin
                },
                data:{
                    friends : {
                        disconnect : {intraLogin : receiverName,},
                    }
                },
                select:
                {
                    intraLogin: true,
                    avatarLink: true,
                    nickname: true,
                    status: true,
                }
            })
            const receiver = await this.prisma.user.update({
                where: {
                    intraLogin : receiverName
                },
                data:{
                    friends : {
                        disconnect : {intraLogin : sender.intraLogin,},
                    }
                }
            })
            if (!sender_ || !receiver)
                return "failed";
            this.gateway.server.to(sender.intraLogin).emit('friendRemoved', {sender: {intraLogin: sender.intraLogin, nickname: sender.nickname, avatarLink: sender.avatarLink}, receiver: receiverName});
            this.gateway.server.to(receiverName).emit('friendRemoved', {sender: {intraLogin: sender.intraLogin, nickname: sender.nickname, avatarLink: sender.avatarLink}, receiver: receiverName});
            this.gateway.server.to(receiverName).emit('friendRemovedNotif', {sender: {intraLogin: sender.intraLogin, nickname: sender.nickname, avatarLink: sender.avatarLink}, receiver: receiverName});
            return sender_;
        }
        else
            throw new ForbiddenException("cannot remove friend because it's not your friend ");
    }
    
    async acceptFriendRequest(sender : User, receiverName : string)
    {
        const receiverExists = await this.prisma.user.findUnique({where: {intraLogin: receiverName}});
        if (!receiverExists || receiverExists.nickname == null)
            throw new NotFoundException("user does not exist");
        const isRequested = await this.isAlreadyFriendsOrRequesting(sender.intraLogin, receiverName, 4)
        if (isRequested)
        {
            const reciever = await this.prisma.user.update({
                where:{
                    intraLogin: receiverName
                },
                data : {
                    requesting : {disconnect : {intraLogin: receiverName}},
                    friends: {connect: {intraLogin: sender.intraLogin}}
                }
            })
            if (!reciever)
                return "user does not exist";
            const sender_ = await this.prisma.user.update({
                where:{
                    intraLogin : sender.intraLogin
                },
                data:{
                    requested : {disconnect : {intraLogin: receiverName}},
                    friends: {connect: {intraLogin: receiverName}}
                },
                select:
                {
                    intraLogin: true,
                    avatarLink: true,
                    nickname: true,
                    status: true,
                }
            })
            if (!sender_)
                throw new ForbiddenException("failed");
            this.gateway.server.to(sender.intraLogin).emit('friendAccepted', {sender: {intraLogin: sender.intraLogin, nickname: sender.nickname, avatarLink: sender.avatarLink}, receiver: receiverName});
            this.gateway.server.to(receiverName).emit('friendAccepted', {sender: {intraLogin: sender.intraLogin, nickname: sender.nickname, avatarLink: sender.avatarLink}, receiver: receiverName});
            this.gateway.server.to(receiverName).emit('friendAcceptedNotif', {sender: {intraLogin: sender.intraLogin, nickname: sender.nickname, avatarLink: sender.avatarLink}, receiver: receiverName});
            return sender_
        }
        throw new ForbiddenException("is already friends or has not requested friendship");
    }

    async rejectFriendship(sender : User, receiverName:string)
    {
        const isRequested = await this.isAlreadyFriendsOrRequesting(sender.intraLogin, receiverName, 4);
        if (isRequested)
        {
            const reciever = await this.prisma.user.update({
                where:{
                    intraLogin: receiverName
                },
                data : {
                    requesting : {disconnect : {intraLogin: receiverName}},
                }
            })
            if (!reciever || reciever.nickname == null)
                throw new NotFoundException("not found");
            const sender_ = await this.prisma.user.update({
                where:{
                    intraLogin : sender.intraLogin
                },
                data:{
                    requested : {disconnect : {intraLogin: receiverName}},
                },
                select:
                {
                    intraLogin: true,
                    avatarLink: true,
                    nickname: true,
                    status: true,
                }
            })
            if (!sender_)
                throw new ForbiddenException("failed");
            this.gateway.server.to(sender.intraLogin).emit('friendRejected', {sender: {intraLogin: sender.intraLogin, nickname: sender.nickname, avatarLink: sender.avatarLink}, receiver: receiverName});
            this.gateway.server.to(receiverName).emit('friendRejected', {sender: {intraLogin: sender.intraLogin, nickname: sender.nickname, avatarLink: sender.avatarLink}, receiver: receiverName});
            this.gateway.server.to(receiverName).emit('friendRejectedNotif', {sender: {intraLogin: sender.intraLogin, nickname: sender.nickname, avatarLink: sender.avatarLink}, receiver: receiverName});
            return sender_
        }
        throw new ForbiddenException("is not requested");
    }

    async cancelFriendRequest(sender: User, receiverName : string)
    {
        const isRequesting = await this.isAlreadyFriendsOrRequesting(sender.intraLogin, receiverName, 2);
        if (isRequesting)
        {
            const reciever = await this.prisma.user.update({
                where:{
                    intraLogin: receiverName
                },
                data : {
                    requested : {disconnect : {intraLogin: receiverName}},
                }
            })
            if (!reciever || reciever.nickname == null)
                throw new NotFoundException("user does not exist");
            const sender_ = await this.prisma.user.update({
                where:{
                    intraLogin : sender.intraLogin
                },
                data:{
                    requesting : {disconnect : {intraLogin: receiverName}},
                },
                select:
                {
                    intraLogin: true,
                    avatarLink: true,
                    nickname: true,
                    status: true,
                }
            })
            if (!sender_)
                return new ForbiddenException("failed");
            this.gateway.server.to(sender.intraLogin).emit('friendRequestCancelled', {sender: {intraLogin: sender.intraLogin, nickname: sender.nickname, avatarLink: sender.avatarLink}, receiver: receiverName});
            this.gateway.server.to(receiverName).emit('friendRequestCancelled', {sender: {intraLogin: sender.intraLogin, nickname: sender.nickname, avatarLink: sender.avatarLink}, receiver: receiverName});
            this.gateway.server.to(receiverName).emit('friendRequestCancelledNotif', {sender: {intraLogin: sender.intraLogin, nickname: sender.nickname, avatarLink: sender.avatarLink}, receiver: receiverName});
            return sender_
        }
        throw new ForbiddenException("already requesting");
    }
    
    async blockUser(sender:User, receiverName : string)
    {
        const user = await this.prisma.user.findUnique({
            where:{
                intraLogin: sender.intraLogin,
            },
            include : {
                friends:true,
                requested : true,
                requesting: true,
                blocked:true,
                blockedOf:true
            }
        })
        if (!user)
            throw new NotFoundException("something went really bad ask sixie");
        const receiverExists = await this.prisma.user.findUnique({where: {intraLogin: receiverName}});
        if (!receiverExists || receiverExists.nickname == null)
            throw new NotFoundException("user does not exist");
        const isFriendsWith = user.friends.some(friend => friend.intraLogin === receiverName || friend.nickname === receiverName)
        const isRequested = user.requested.some(frequest => frequest.intraLogin === receiverName || frequest.nickname === receiverName)
        const isRequesting = user.requesting.some(frequest => frequest.intraLogin === receiverName || frequest.nickname === receiverName)
        const isBlocked = user.blocked.some(block => block.intraLogin === receiverName || block.nickname === receiverName)
        const isBlockedOf = user.blockedOf.some(block => block.intraLogin === receiverName || block.nickname === receiverName)
        if (isFriendsWith)
            await this.removeFriend(sender, receiverName);
        if (isRequested)
            await this.rejectFriendship(sender, receiverName);
        if (isRequesting)
            await this.cancelFriendRequest(sender, receiverName);
        if (!isBlocked && !isBlockedOf)
        {
            try
            {
            const sender_ = await this.prisma.user.update({
                where:{
                    intraLogin: sender.intraLogin
                },
                data : {
                    blocked : {
                        connect : {intraLogin: receiverName},
                    }
                },
                select:
                {
                    intraLogin: true,
                    avatarLink: true,
                    nickname: true,
                    status: true,
                }
            })
            if (!sender_ || sender_.nickname == null)
                throw new ForbiddenException("failed");
            delete sender.id;
            this.gateway.server.to(sender.intraLogin).emit('userBlocked', {sender: {intraLogin: sender.intraLogin, nickname: sender.nickname, avatarLink: sender.avatarLink}, receiver: receiverName});
            this.gateway.server.to(receiverName).emit('userBlocked', {sender: {intraLogin: sender.intraLogin, nickname: sender.nickname, avatarLink: sender.avatarLink}, receiver: receiverName});
            return (sender)
            }
            catch(e)
            {
                throw new NotFoundException("user does not exist");
            }
        }
        else 
            throw new ForbiddenException("already blocked");
    }

    async unblockUser(sender:User, receiverName : string)
    {
        const user = await this.prisma.user.findUnique({
            where:{
                intraLogin: sender.intraLogin,
            },
            include : {
                blocked:true,
            }
        })
        if (!user)
            throw new NotFoundException("something went really bad ask sixie");
        const receiverExists = await this.prisma.user.findUnique({where: {intraLogin: receiverName}});
        if (!receiverExists || receiverExists.nickname == null)
            throw new NotFoundException("user does not exist");
        const isBlocked = user.blocked.some(block => block.intraLogin === receiverName || block.nickname === receiverName)
        if (isBlocked)
        {
            const sender_ = await this.prisma.user.update({
                where:{
                    intraLogin: sender.intraLogin
                },
                data : {
                    blocked : {
                        disconnect : {intraLogin: receiverName},
                    }
                },
                select:
                {
                    intraLogin: true,
                    avatarLink: true,
                    nickname: true,
                    status: true,
                }
            })
            if (!sender_)
                throw new ForbiddenException("failed");
            delete sender.id;
            this.gateway.server.to(sender.intraLogin).emit('userUnblocked', {sender: {intraLogin: sender.intraLogin, nickname: sender.nickname, avatarLink: sender.avatarLink}, receiver: receiverName});
            this.gateway.server.to(receiverName).emit('userUnblocked', {sender: {intraLogin: sender.intraLogin, nickname: sender.nickname, avatarLink: sender.avatarLink}, receiver: receiverName});
            return (sender)
        }
        else 
            throw new ForbiddenException("not blocked");
    }

    async updateNickname(sender: User, nick: string)
    {
        if (nick.length > 32)
            throw new ForbiddenException("nickname too long");
        if (nick.length < 3)
            throw new ForbiddenException("nickname too short");
        if (nick.includes(" "))
            throw new ForbiddenException("nickname cannot contain spaces");
        if ((nick.charCodeAt(0) < 65 || nick.charCodeAt(0) > 90) && (nick.charCodeAt(0) < 97 || nick.charCodeAt(0) > 122))
            throw new ForbiddenException("nickname should start with a letter");
        try {
            const user = await this.prisma.user.update({
                where:{
                    intraLogin: sender.intraLogin
                },
                data:{
                    nickname: nick
                },
                select:
                {
                    intraLogin: true,
                    avatarLink: true,
                    nickname: true,
                    status: true,
                }
            });
            if (!user)
                throw new NotFoundException("something went really bad ask sixie");
            this.gateway.server.emit("nicknameChanged", {sender: sender.intraLogin, nickname: nick});
            return (user);
        }
        catch (err)
        {
            throw new ForbiddenException("nickname already exists");
        }
    }

    async updateAvatar(sender: User, image: Express.Multer.File)
    {
        try
        {
            if (image.size > 5 * 10**6 || image.mimetype != "image/jpeg")
            {
                fs.unlinkSync(image.path);
                throw new UnsupportedMediaTypeException("failed to upload image");
            }
            const currImage = sender.avatarLink;
            if (this.isCloudinaryImage(currImage))
            {
                let imageId = await this.getCloudinaryImageId(currImage);
                imageId = "avatars/" + imageId;
                const res = await cloudinary.v2.api.delete_resources([imageId]);
            }
            const imageUrl = await cloudinary.v2.uploader.upload(image.path, {folder: 'avatars'});
            const user = await this.prisma.user.update({
                where:{
                    intraLogin: sender.intraLogin
                },
                data:{
                    avatarLink: imageUrl.url
                },
                select:
                {
                    intraLogin: true,
                    avatarLink: true,
                    nickname: true,
                    status: true,
                }
            });
            if (!user)
                throw new NotFoundException("something went really bad ask sixie");
            fs.unlinkSync(image.path);
            this.gateway.server.emit('avatarUpdated', {sender: user.intraLogin})
            return (user);
        }
        catch (err)
        {
            if (image.path)
                fs.unlinkSync(image.path);
            throw new UnsupportedMediaTypeException("failed to upload image");
        }
    }

async enable2fa(user: User)
{
    if ((await this.prisma.user.findUnique({where: {id: user.id}})).TFA)
      throw new ForbiddenException('Two Factor Authentication is already enabled');
    return (await this.generateTwoFactorAuthenticationSecret(user));
}

async validate2FACode(user: User, code: string)
{
    const secret = (await this.prisma.user.findUnique({where: {id: user.id}})).twoFaSecret;
    const isValid = await authenticator.verify({token: code, secret});
    if (isValid)
        return await this.prisma.user.update({where: {id: user.id}, data: {TFA: true}, select:
            {
                intraLogin: true,
                avatarLink: true,
                nickname: true,
            }});
    throw new ForbiddenException('Invalid Two Factor Authentication code');
}

  async disable2fa(user: User)
  {
    if (!(await this.prisma.user.findUnique({where: {id: user.id}})).TFA)
      throw new ForbiddenException('Two Factor Authentication is already disabled');
    return await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        TFA: false,
      },
      select:
                {
                    intraLogin: true,
                    avatarLink: true,
                    nickname: true,
                    TFA: true,
                }
    });
  }

  async generateTwoFactorAuthenticationSecret(user: User)
  {
    const secret = await authenticator.generateSecret();
    const otpAuthUrl = await authenticator.keyuri(user.intraLogin, this.configService.get("APP_NAME"), secret);
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        twoFaSecret: secret,
      },
    });
    return this.generateQrCodeDataURL(otpAuthUrl);
  }

  async generateQrCodeDataURL(otpAuthUrl: string) 
  {
    return toDataURL(otpAuthUrl);
  }

  isCloudinaryImage(url: string): boolean
  {
    return url.includes('res.cloudinary.com');
  }

    async getCloudinaryImageId(url: string): Promise<string>
    {
        const imageId = url.split('/').pop().split('.')[0];
        return imageId;
    }
}

