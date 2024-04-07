import { Injectable } from "@nestjs/common";
import { MessageDto } from "./message.dto";

enum accessType{
    Private,
    Protected,
    Public
}

enum channelType
{
    DM,
    Channel
}

@Injectable()
export class ChannelDto
{
    id:number;
    createdAt: Date;
    title: string;
    description: string;
    members : string[];
    admins: string[];
    messages : MessageDto[];
    type : channelType;
    access : accessType
}

