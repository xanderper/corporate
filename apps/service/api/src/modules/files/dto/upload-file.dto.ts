import { IsString, IsNotEmpty, IsOptional, IsEnum } from "class-validator";

export enum FileCategory {
  FINANCIAL_REPORT = "FINANCIAL_REPORT",
  CAP_TABLE = "CAP_TABLE",
  LEGAL = "LEGAL",
  GOVERNANCE = "GOVERNANCE",
  GENERAL = "GENERAL",
}

export class UploadFileDto {
  @IsString()
  @IsNotEmpty()
  organizationId!: string;

  @IsOptional()
  @IsEnum(FileCategory)
  category?: FileCategory;

  @IsOptional()
  @IsString()
  uploaderUserId?: string;
}
