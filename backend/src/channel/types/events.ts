import { MessageDto} from "src/messages/dto";

export interface serverToClientEvents
{
    DM: (paylod: MessageDto) => void;
}