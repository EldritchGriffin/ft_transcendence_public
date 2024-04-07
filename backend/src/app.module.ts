import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ChannelModule } from './channel/channel.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { GameGatewayModule } from './game/game.module';
import { ChannelGateway } from './channel/channel.gateway';
import { MessageModule } from './messages/message.module';
import { APP_GUARD } from '@nestjs/core';
import { WsJwtAuthGuard } from './auth/guards';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    PrismaModule,
    ChannelModule,
    LeaderboardModule,
    GameGatewayModule,
    MessageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
