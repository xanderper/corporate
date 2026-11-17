import { Controller, Get, Post, Body, Param, Query } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SynchronizeDto } from "./dto/synchronize.dto";
import { AcceptInviteDto } from "./dto/accept-invite.dto";

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("auth/me")
  async getMe(
    @Query("qorveUserId") qorveUserId?: string,
    @Query("email") email?: string
  ) {
    return this.authService.getIdentity(qorveUserId, email);
  }

  @Post("auth/synchronize")
  async synchronize(@Body() dto: SynchronizeDto) {
    return this.authService.synchronize(dto);
  }

  @Get("invite/:token")
  async verifyInvite(@Param("token") token: string) {
    return this.authService.verifyInvitation(token);
  }

  @Post("invite/:token")
  async acceptInvite(
    @Param("token") token: string,
    @Body() dto: AcceptInviteDto
  ) {
    return this.authService.acceptInvitation(token, dto);
  }
}
