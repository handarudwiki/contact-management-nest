
export class RegisterUserRequest{
    username:string
    password:string
    name:string
} 

export class UserResponse{
    username:string
    name:string
}

export class LoginResponse{
    token:string
}

export class LoginUserRequest{
    username:string
    password:string
}

export class UpdateUserRequets{
    name?:string
    password? :string
}