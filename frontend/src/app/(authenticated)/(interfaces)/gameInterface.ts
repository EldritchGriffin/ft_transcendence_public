import { User } from './userInterface';
export interface Game 
{
    gameId:string;
    players:User[];
    result:number;
    startedAt:Date;
    finishedAt:Date;
}