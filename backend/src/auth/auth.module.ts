import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { FTStrategy } from './strategy/42.strategy';
import { JwtStrategy } from './strategy';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';


@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, FTStrategy, JwtStrategy],
})
export class AuthModule {}