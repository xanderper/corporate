import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  BadRequestException,
  Headers,
} from "@nestjs/common";
import { FilesService } from "./files.service";
import { File as FileRecord } from "../../database/schema";
import { UploadFileDto } from "./dto/upload-file.dto";

@Controller()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get("files")
  async listFiles(
    @Query("organizationId") organizationId: string
  ): Promise<{ files: FileRecord[] }> {
    if (!organizationId) {
      throw new BadRequestException("organizationId query parameter is required");
    }
    const files = await this.filesService.listFilesByOrganization(organizationId);
    return { files };
  }

  @Get("organizations/:slug/files")
  async listOrgFiles(
    @Param("slug") slug: string
  ): Promise<{ files: FileRecord[] }> {
    const files = await this.filesService.listFilesByOrganization(slug);
    return { files };
  }

  @Post("files/upload")
  async uploadFile(
    @Body() dto: UploadFileDto,
    @Headers("x-qorve-user-id") actorId?: string
  ): Promise<{ success: boolean; file: FileRecord }> {
    const file = await this.filesService.registerFile({
      organizationId: dto.organizationId,
      uploaderUserId: dto.uploaderUserId || actorId || "Virex User",
      fileName: "financial_report.pdf",
      fileSize: 1024 * 128,
      mimeType: "application/pdf",
      category: dto.category,
    });
    return { success: true, file };
  }

  @Get("files/:id/download")
  async getDownloadUrl(
    @Param("id") id: string
  ): Promise<{ downloadUrl: string; file: FileRecord }> {
    return this.filesService.getDownloadUrl(id);
  }
}
