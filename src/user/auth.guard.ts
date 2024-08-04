import { PrismaService } from './../common/prisma.service';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

@Injectable()
export class AuthGuard implements CanActivate{
    constructor(private jwtService :JwtService, private prismaService:PrismaService){}

    private extractTokenFromHeader(request:Request):string|undefined{
        const [type, token] = request.headers.authorization?.split(' ')??[];
        return type === 'Bearer' ? token :undefined
    }

    async canActivate(context: ExecutionContext):Promise<boolean>{
        const request = context.switchToHttp().getRequest()
        const token = this.extractTokenFromHeader(request)

        if(!token){
            throw new UnauthorizedException()
        }
        try {
            const username =  this.jwtService.verify(token, {
                secret:process.env.JWT_SECRET
            })

            const user = await this.prismaService.user.findUnique({
                where:{
                    username
                }
            })
            request['user'] = user
        } catch (error) {
            throw new UnauthorizedException()
        }

        return true
    }
}