import { Controller, Get, Post, Body, Param, Headers } from "@nestjs/common";
import { UsersService } from "./users.service";
import { InviteUserDto } from "./dto/invite-user.dto";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async listUsers() {
    return this.usersService.listUsersAndInvitations();
  }

  @Post()
  async inviteUser(
    @Body() dto: InviteUserDto,
    @Headers("host") hostHeader?: string
  ) {
    return this.usersService.inviteUser(dto, hostHeader);
  }

  @Post(":id/suspend")
  async suspendUser(
    @Param("id") id: string,
    @Body("actorId") actorId?: string
  ) {
    return this.usersService.suspendUser(id, actorId);
  }

  @Post(":id/reactivate")
  async reactivateUser(
    @Param("id") id: string,
    @Body("actorId") actorId?: string
  ) {
    return this.usersService.reactivateUser(id, actorId);
  }

  @Post("invitations/:id/resend")
  async resendInvitation(
    @Param("id") id: string,
    @Body("actorId") actorId?: string,
    @Headers("host") hostHeader?: string
  ) {
    return this.usersService.resendInvitation(id, actorId, hostHeader);
  }

  @Post("invitations/:id/revoke")
  async revokeInvitation(
    @Param("id") id: string,
    @Body("actorId") actorId?: string
  ) {
    return this.usersService.revokeInvitation(id, actorId);
  }
}
