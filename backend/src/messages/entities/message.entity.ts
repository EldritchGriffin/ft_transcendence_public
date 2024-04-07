export class MessageEntity
{
    content: string;
    channelId: number;
    senderLogin: string;
    senderAvatar: string;
}

export class MuteEntity
{
    channelId:number;
    senderLogin: string;
    toMuteLogin: string;
    mutePeriod: number; 
}