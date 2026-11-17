import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsIn,
  IsDateString,
} from "class-validator";
import { Type } from "class-transformer";

export class AddOwnershipDto {
  /**
   * Slug of the organization that OWNS (the acquirer, e.g. "virex-capital").
   */
  @IsString()
  @IsNotEmpty()
  ownerSlug: string;

  /**
   * Slug of the organization being ACQUIRED (e.g. "acme-logistics").
   */
  @IsString()
  @IsNotEmpty()
  ownedSlug: string;

  /**
   * Ownership stake in percent — e.g. 100 for full acquisition, 51 for majority.
   */
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(100)
  ownershipPercentage: number;

  @IsOptional()
  @IsIn(["DIRECT", "INDIRECT", "JOINT_VENTURE"])
  relationshipType?: string;

  /**
   * ISO 8601 date when the acquisition takes effect, e.g. "2026-09-28".
   * Defaults to today.
   */
  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  /**
   * ISO 8601 date when the ownership expires (leave empty for indefinite).
   */
  @IsOptional()
  @IsDateString()
  effectiveUntil?: string;

  /** ID of the acting user (for the audit log). */
  @IsOptional()
  @IsString()
  actorId?: string;
}
