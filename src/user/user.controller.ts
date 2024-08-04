import { Body, Controller, Get, HttpCode, Patch, Post, Request, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { WebResponse } from "src/model/web.mode.";
import { LoginResponse, LoginUserRequest, RegisterUserRequest, UpdateUserRequets, UserResponse } from "src/model/user.model";
import { get } from "http";
import { AuthGuard } from "./auth.guard";


@Controller('/api/users')
export class UserController{
    constructor(
       private userService:UserService
    ){}

    @Post('/register')
    @HttpCode(200)
    async register(
        @Body() request:RegisterUserRequest
    ):Promise<WebResponse<UserResponse>> {
        const result = await this.userService.register(request)
        return {
            data:result
        }
    }

    @Post('/login')
    @HttpCode(200)
    async login(
        @Body() request:LoginUserRequest
    ):Promise<WebResponse<LoginResponse>> {
        const result = await this.userService.login(request)
        return {
         data: result
        }
    }

    @Get('/me')
    @HttpCode(200)
    @UseGuards(AuthGuard)
    async get(@Request() req):Promise<WebResponse<UserResponse>>{
        const result = await this.userService.get(req.user)
        return {
            data:result
        }
    }
    
    @Patch('update')
    @HttpCode(200)
    @UseGuards(AuthGuard)
    async update(@Request() req, @Body() updateUserRequest:UpdateUserRequets) :Promise<WebResponse<UserResponse>>{
        const result = await this.userService.update(req, updateUserRequest)
        return {
            data:result
        }
    }
}