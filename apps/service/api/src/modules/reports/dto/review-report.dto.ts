import { IsIn, IsNotEmpty, IsString } from "class-validator";

export class ReviewReportDto {
  @IsNotEmpty()
  @IsIn(["APPROVED", "REJECTED"])
  status: "APPROVED" | "REJECTED";

  @IsNotEmpty()
  @IsString()
  reviewerId: string;
}
