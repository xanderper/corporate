import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AcceptInviteDto {
  @IsNotEmpty()
  @IsString()
  qorveUserId: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
