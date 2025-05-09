import { IsInt, Min, Max, IsString, Matches } from 'class-validator';

export class CreateOpeningHourDto {
  @IsInt()
  @Min(0) @Max(6)
  dayOfWeek: number;

  @IsString()
  @Matches(/^\d{2}:\d{2}:\d{2}$/)
  openTime: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}:\d{2}$/)
  closeTime: string;
}
