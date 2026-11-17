import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class InviteUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  invitedBy?: string;
}
