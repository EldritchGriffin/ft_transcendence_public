import { Module } from '@nestjs/common';
import { ChannelGateway } from './channel.gateway';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import { MessageModule } from 'src/messages/message.module';

@Module({
    imports: [MessageModule],
    exports: [ChannelGateway],
    providers: [ChannelGateway, ChannelService],
    controllers: [ChannelController],
})
export class ChannelModule {}
