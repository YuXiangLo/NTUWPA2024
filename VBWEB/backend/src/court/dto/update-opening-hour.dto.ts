import { IsInt, Min, Max, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateOpeningHourDto {
  @IsOptional()
  @IsInt() @Min(0) @Max(6)
  dayOfWeek?: number;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}:\d{2}$/)
  openTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}:\d{2}$/)
  closeTime?: string;
}
