import { Body, Controller, ForbiddenException, Get, Param, Post, UseFilters, UseGuards } from "@nestjs/common";
import { ViewAuthFilter } from "src/auth/filters/auth.filter";
import { JwtGuard } from "src/auth/guards";
import { MessageService } from "./message.service";
import { GetUser } from "src/auth/decorator";
import { User } from "@prisma/client";
import { MessageEntity } from "./entities/message.entity";

@UseGuards(JwtGuard)
@Controller('messages')
export class MessageController
{
    constructor(private messageService: MessageService)
    {}

    @Get('findall/:channel')
    findAll(@GetUser() user: User, @Param('channel') channel)
    {
        try{
        if (!user.nickname)
            throw new ForbiddenException('nickname is required for this route');
        if (!channel)
            throw new ForbiddenException('channel is required for this route');
        const id = parseInt(channel, 10);
        if (isNaN(id)) throw new ForbiddenException("Invalid channel id");
        return this.messageService.findAll(user ,id);
        } catch (e) {
            throw new ForbiddenException(e.message);
        }
    }
}
