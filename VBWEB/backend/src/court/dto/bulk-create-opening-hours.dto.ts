// src/court/dto/bulk-create-opening-hours.dto.ts
import { Type } from 'class-transformer';
import { ValidateNested, IsArray } from 'class-validator';
import { CreateOpeningHourDto } from './create-opening-hour.dto';

export class BulkCreateOpeningHoursDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOpeningHourDto)
  periods: CreateOpeningHourDto[];
}
