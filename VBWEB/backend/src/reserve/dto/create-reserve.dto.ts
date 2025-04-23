// src/reserve/dto/create-reserve.dto.ts
import { IsUUID, IsArray, ArrayMinSize, IsInt, Min, IsIn, IsOptional, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SlotDto {
  @IsString()
  date: string;      // e.g. '2025-04-14'
  
  @IsString()
  time: string;      // e.g. '14:00'
}

export class CreateReserveDto {
  @IsUUID()
  user_id: string;

  @IsString()
  venue_id: string;

  @IsString()
  court_id: string;

  @IsArray()
  @ArrayMinSize(1)
  slots: SlotDto[];

  @IsInt()
  @Min(0)
  cur_male_count: number;

  @IsInt()
  @Min(0)
  max_male_count: number;

  @IsInt()
  @Min(0)
  cur_female_count: number;

  @IsInt()
  @Min(0)
  max_female_count: number;

  @IsIn(['public', 'private'])
  privacy_type: 'public' | 'private';

  @IsString()
  @IsOptional()
  level?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  fee: number;

  @IsString()
  @IsOptional()
  remark?: string;
}
