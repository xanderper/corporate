import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateReportDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  period: string;

  @IsOptional()
  @IsString()
  status?: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

  @IsOptional()
  @IsNumber()
  revenue?: number;

  @IsOptional()
  @IsNumber()
  expenses?: number;

  @IsOptional()
  @IsNumber()
  ebitda?: number;

  @IsOptional()
  @IsNumber()
  cash?: number;

  @IsOptional()
  @IsNumber()
  headcount?: number;

  @IsOptional()
  @IsNumber()
  majorProjects?: number;

  @IsOptional()
  @IsNumber()
  risksCount?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  submittedById?: string;
}
