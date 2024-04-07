import { Injectable } from "@nestjs/common";

@Injectable()
export class MessageDto
{
    id:number;
    content:string;
    channelId: number;
    senderLogin: string;
}