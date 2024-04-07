import { Module } from '@nestjs/common';
import { gameGateway } from './game.gateway';
import { gameService } from './game.service';
import { ChannelModule } from 'src/channel/channel.module';

@Module({
  providers: [gameGateway, gameService],
  imports: [ChannelModule],
})
export class GameGatewayModule {}
