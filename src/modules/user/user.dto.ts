import { RoleEnum } from "../../DB/models/user.model";

export interface CreateUserDto {
    firstName: string;
    lastName: string;
    username?: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: RoleEnum;
}


export interface LoginUserDto {
    email: string;
    password: string;
}