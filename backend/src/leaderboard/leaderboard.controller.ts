import { Controller, Get } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController 
{
    constructor (private leaerBoard: LeaderboardService){}
    @Get()
    getLeaderBoard()
    {
        return this.leaerBoard.getSortedUsers();
    }
}
