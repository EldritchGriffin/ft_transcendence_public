import { type } from "os";
import { User } from "./userInterface";
export interface Channel {
  id: number;
  createdAt: Date;
  title: string;
  description: string | null;
  members: User[];
  admins: User[];
  access: string;
  type: string;
  ownerLogin: string;
  bannedUsers: string[];
}

export interface sender {
  avatarLink: string;
  intraLogin: string;
  nickname: string;
}

export interface notif_element {
  id: number;
  action: string;
  receiver: string;
  sender: sender;
}

