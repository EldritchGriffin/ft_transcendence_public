import { MessageEntity } from "src/messages/entities/message.entity";

export interface DMEvent
{
    DM: (payload : MessageEntity) => void;
}