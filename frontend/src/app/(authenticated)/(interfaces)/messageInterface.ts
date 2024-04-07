import { User } from "./userInterface";

export interface Message {
  channelId: number;
  senderLogin: string;
  content: string;
  id: number;
  sender: { avatarLink: string };
}
