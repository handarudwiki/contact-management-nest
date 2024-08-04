import { LoginResponse, LoginUserRequest, UpdateUserRequets, UserResponse } from './../model/user.model';
import { HttpException, Inject, Injectable } from "@nestjs/common";
import {Logger} from "winston"
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { ValidationService } from "src/common/validation.service";
import { PrismaService } from "src/common/prisma.service";
import { RegisterUserRequest } from "src/model/user.model";
import { request } from 'http';
import { UserValidation } from './user.validation';
import bcrypt from "bcryptjs"
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()

export class UserService{
    constructor(
        private validatinService:ValidationService,
        @Inject(WINSTON_MODULE_PROVIDER) private logger:Logger,
        private prismaService :PrismaService,
        private jwtService:JwtService
    ){}

    async register(request:RegisterUserRequest): Promise<UserResponse>{
        this.logger.debug(`Register new user ${JSON.stringify(request)}`)
        const registerRequest:RegisterUserRequest = this.validatinService.validate(UserValidation.REGISTER,request )
        
        const userExist = await this.prismaService.user.findUnique({
            where:{
                username:registerRequest.username
            }
        })

        if(userExist){
            throw new HttpException("Username already exist", 400)
        }

        registerRequest.password = await bcrypt.hash(registerRequest.password, 10)

        const user = await this.prismaService.user.create({
            data:{
                name:registerRequest.name,
                password:registerRequest.password,
                username:registerRequest.username
            }
        })

        return{
            username:user.username,
            name:user.name
        }
    }

    async login(request:LoginUserRequest):Promise<LoginResponse>{
        const loginRequest:LoginUserRequest = this.validatinService.validate(UserValidation.LOGIN, request)

        const user = await this.prismaService.user.findUnique({
            where:{
                username:loginRequest.username
            }
        })

        if(!user){
            throw new HttpException("Username ora pasword is wrong", 401)
        }

        const isPasswordvalid = await bcrypt.compare(loginRequest.password, user.password)

        if(!isPasswordvalid){
            throw new HttpException("Username ora pasword is wrong", 401)
        }

        const token = this.jwtService.sign(loginRequest.username)
        return {
            token
        }
    }

    async get(user:User):Promise<UserResponse>{
        return {
            username:user.username,
            name:user.name
        }
    }

    async update(user:User, request:UpdateUserRequets):Promise<UserResponse>{
        this.logger.debug(`Update user ${user.username} with ${JSON.stringify(request)}`)

        const updateRequest:UpdateUserRequets = this.validatinService.validate(UserValidation.UPDATE, request)

        if(updateRequest.name){
            user.name = updateRequest.name
        }

        if(request.password){
            user.password = await bcrypt.hash(updateRequest.password, 10)
        }

        const result = await this.prismaService.user.update({
            where:{
                username:user.username
            },
            data:user
        })

        return {
            name :result.name,
            username:result.username
        }
    }
}
