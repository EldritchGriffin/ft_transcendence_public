import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { ChannelModule } from 'src/channel/channel.module';

@Module({
  imports:[JwtModule.register({}),
    MulterModule.register({
      dest: './uploads',
    }), ChannelModule],
  controllers: [UserController],
  providers: [UserService, JwtService]
})
export class UserModule {}
