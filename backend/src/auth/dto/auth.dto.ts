import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class AuthDto
{
    id: number;
    email: string;
    login: string;
    image_url: string;
}