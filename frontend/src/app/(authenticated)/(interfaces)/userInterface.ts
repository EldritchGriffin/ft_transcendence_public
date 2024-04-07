import { Game } from "./gameInterface";
export interface User {
  intraLogin: string;
  nickname: string | null;
  score: number;
  matchHistory: Game[];
  friends: User[];
  requested: User[];
  blocked: User[];
  avatarLink: string | null;
  status: string;
  TFA: boolean;
}
