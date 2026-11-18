import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsIn,
  IsUrl,
  MaxLength,
  Matches,
} from "class-validator";

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  legalName: string;

  /**
   * URL-safe slug, e.g. "virex-tech" — auto-generated from `name` if omitted.
   */
  @IsOptional()
  @IsString()
  @MaxLength(128)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "slug must be lowercase letters, digits, and hyphens only (e.g. virex-tech)",
  })
  slug?: string;

  @IsOptional()
  @IsIn(["HOLDING", "SUBSIDIARY", "PORTFOLIO", "JOINT_VENTURE", "FUND"])
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
