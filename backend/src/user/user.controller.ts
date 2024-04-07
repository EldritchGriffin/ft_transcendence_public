import { Body, Controller, ForbiddenException, Get, HttpCode, HttpStatus, Param, ParseFilePipe, ParseFilePipeBuilder, Post, Res, UploadedFile, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { ViewAuthFilter } from 'src/auth/filters/auth.filter';
import { FTGuard, JwtGuard } from 'src/auth/guards';
import { UserService } from './user.service';
import { UserGuards } from './guards';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtGuard)
@Controller('/user')
export class UserController {
    constructor(private userService: UserService){}
    @Get('/me')
    getUser(@GetUser() user: User)
    {
        return this.userService.getSelfUserInfo(user);
    }
    @Get('/all')
    getAllUsers(@GetUser() user: User)
    {
        if (!user.nickname)
            throw new ForbiddenException('nickname is required for this route');
        return this.userService.getAllUsers();
    }
    @Get('/blocked')
    getBlocked(@GetUser() currUser:User)
    {
        if (!currUser.nickname)
            throw new ForbiddenException('nickname is required for this route');
        return this.userService.getBlocked(currUser);
    }
    @Get('/enable2fa')
    enable2fa(@GetUser() user:User)
    {
        if (!user.nickname)
            throw new ForbiddenException('nickname is required for this route');
        return this.userService.enable2fa(user);
    }
    @Get('/disable2fa')
    disable2fa(@GetUser() user:User)
    {
        if (!user.nickname)
            throw new ForbiddenException('nickname is required for this route');
        return this.userService.disable2fa(user);
    }
    @Get('/logout')
    logout(@Res() res)
    {
        res.clearCookie('token');
        res.redirect('/');
    }
    @Get('/:user')
    getAny(@Param('user') user:string, @GetUser() currUser: User)
    {
        if (!currUser.nickname)
            throw new ForbiddenException('nickname is required for this route');
        if (!user)
            throw new ForbiddenException("invalid user");
        if (user === currUser.intraLogin || user === currUser.nickname)
            return this.getUser(currUser);
        else
            return this.userService.getUserInfo(user);
    }
    @Post('/addfriend/:user') 
    sendFriendRequest(@GetUser() sender:User, @Param('user') reciever:string)
    {
        if (!sender.nickname)
            throw new ForbiddenException('nickname is required for this route');
        if (!reciever)
            throw new ForbiddenException("invalid user");
        if (sender.intraLogin === reciever || sender.nickname === reciever)
            throw new ForbiddenException("cannot add self");
        return this.userService.requestFriendship(sender, reciever);
    }
    @Post('/removefriend/:user')
    removeFriend(@GetUser() sender:User, @Param('user') reciever:string)
    {
        if (!sender.nickname)
            throw new ForbiddenException('nickname is required for this route');
        if (!reciever)
            throw new ForbiddenException("invalid user");
        if (sender.intraLogin === reciever || sender.nickname === reciever)
            throw new ForbiddenException("not an allowed action");
        return this.userService.removeFriend(sender, reciever);
    }
    @Post('/acceptfriend/:user')
    acceptFriend(@GetUser() sender:User, @Param('user') reciever:string)
    {
        if (!sender.nickname)
            throw new ForbiddenException('nickname is required for this route');
        if (!reciever)
            throw new ForbiddenException("invalid user");
        if (sender.intraLogin === reciever || sender.nickname === reciever)
            throw new ForbiddenException("not an allowed action");
        return this.userService.acceptFriendRequest(sender, reciever);
    }
    @Post('/rejectfriend/:user')
    rejectFriend(@GetUser() sender:User, @Param('user') reciever:string)
    {
        if (!sender.nickname)
            throw new ForbiddenException('nickname is required for this route');
        if (!reciever)
            throw new ForbiddenException("invalid user");
        if (sender.intraLogin === reciever || sender.nickname === reciever)
            throw new ForbiddenException("not an allowed action");
        return this.userService.rejectFriendship(sender, reciever);
    }
    @Post('/cancelfriend/:user')
    cancelFriendRequest(@GetUser() sender:User, @Param('user') reciever:string)
    {
        if (!sender.nickname)
            throw new ForbiddenException('nickname is required for this route');
        if (!reciever)
            throw new ForbiddenException("invalid user");
        if (sender.intraLogin === reciever || sender.nickname === reciever)
            throw new ForbiddenException("not an allowed action");
        return this.userService.cancelFriendRequest(sender, reciever);
    }
    @Post('/blockuser/:user')
    blockUser(@GetUser() sender:User, @Param('user') reciever:string)
    {
        if (!sender.nickname)
            throw new ForbiddenException('nickname is required for this route');
        if (!reciever)
            throw new ForbiddenException("invalid user");
        if (sender.intraLogin === reciever || sender.nickname === reciever)
            throw new ForbiddenException("not an allowed action");
        return this.userService.blockUser(sender, reciever);
    }

    @Post('/unblockuser/:user')
    unblockUser(@GetUser() sender:User, @Param('user') reciever:string)
    {
        if (!sender.nickname)
            throw new ForbiddenException('nickname is required for this route');
        if (!reciever)
            throw new ForbiddenException("invalid user");
        if (sender.intraLogin === reciever || sender.nickname === reciever)
            throw new ForbiddenException("not an allowed action");
        return this.userService.unblockUser(sender, reciever);
    }

    @Post('/updatenick/:nickname')
    updateNickname(@GetUser() user:User, @Param('nickname') nickname:string)
    {
        if (!nickname)
            throw new ForbiddenException("invalid user");
        return this.userService.updateNickname(user, nickname);
    }

    
    @Post('/updateavatar')
    @UseInterceptors(FileInterceptor('avatar'))
    uploadFile(@GetUser() sender:User,
                @UploadedFile(new ParseFilePipeBuilder()
                            .build({errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY}))
                            file: Express.Multer.File) 
    {
        if (!file)
            throw new ForbiddenException("invalid file");
        return this.userService.updateAvatar(sender, file);
    }

    @Post('/validate2fa')
    validate2fa(@GetUser() user:User, @Body() body)
    {
        if (!user.nickname)
            throw new ForbiddenException('nickname is required for this route');
        try {
            if (!body.code)
                throw new Error("invalid code");
            const code = parseInt(body.code, 10);
            if (isNaN(code))
                throw new Error("invalid code");
            return this.userService.validate2FACode(user, body.code);
        } catch (e) {
            throw new ForbiddenException("invalid code");
        }
    }
}
