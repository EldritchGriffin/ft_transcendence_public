import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LeaderboardService {
    constructor(private prisma :PrismaService) {}
    async getSortedUsers()
    {
        const users = await this.prisma.user.findMany({
            where : {
                score : {
                    gt: 0,
                }
            },
            select :
            {
                intraLogin : true,
                nickname : true,
                score : true,
                avatarLink: true,
                status: true,
            },
            orderBy:{
                score:'desc'
            },
        });
        return users;
    }
}
