import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UserGuards implements CanActivate {
    constructor (private readonly prisma: PrismaService, private jwt : JwtService, private config: ConfigService){}
    async canActivate(context: ExecutionContext): Promise<boolean> 
    {
        const request = context.switchToHttp().getRequest();
        const accessToken:string = request.cookies['token']
        const secretKey = this.config.get('JWT_SECRET');
        try {
            const decodedToken = this.jwt.verify(accessToken, {secret : secretKey});
            const userId = decodedToken.sub;
            const user = await this.prisma.user.findUnique({
                where : {
                    id : userId,
                },
            })
            if (!user.nickname)
                return false;
            return true;
        } catch (error) {
          return false;
        }
    }
}
