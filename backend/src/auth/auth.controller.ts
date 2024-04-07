import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthDto } from './dto';
import { AuthService } from './auth.service';
import { FTGuard } from './guards';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}
    @Get('signin')
    @UseGuards(FTGuard)
    async signin(@Req() req:Request, @Res() res:Response)
    {
        const qrcode = await this.authService.signin(req, res);
        return qrcode;
    }
    @Post('signinTFA')
    async signinTFA(@Req() req:Request, @Body() bod ,@Res() res:Response)
    {
        return await this.authService.signinTFA(req, bod, res);
    }

}
