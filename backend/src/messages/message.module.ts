import { Module } from "@nestjs/common";
import { MessageService } from "./message.service";
import { ChannelModule } from "src/channel/channel.module";
import { MessageController } from "./message.controller";

@Module({
    imports: [],
    providers: [MessageService, MessageController],
    exports: [MessageService],
    controllers: [MessageController]
})
export class MessageModule {}