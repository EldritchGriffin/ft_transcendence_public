import { UserDto } from "src/user/dto";

export class GameDto
{
    gameId: string;
    players: UserDto[];
    result: number;
    startedAt: Date;
    finishedAt: Date;
}