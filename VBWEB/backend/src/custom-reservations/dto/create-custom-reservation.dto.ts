// src/custom-reservations/dto/create-custom-reservation.dto.ts
import {
  IsString, IsNotEmpty, IsNumber, IsOptional,
  IsISO8601, Min, IsIn
} from 'class-validator';

export class CreateCustomReservationDto {
  @IsString() @IsOptional()  venue_name?: string;
  @IsString() @IsNotEmpty()  address:    string;
  @IsString() @IsOptional()  court_name?: string;
  @IsString() @IsOptional()  court_property?: string;

  @IsISO8601()               start_ts: string;
  @IsISO8601()               end_ts:   string;

  @IsNumber() @Min(1)        num_players: number;
  @IsOptional() @IsNumber()  fee?: number;
  @IsIn(['public','private','friend'])
                             visibility: 'public' | 'private' | 'friend';
  @IsString() @IsOptional()  detail?: string;
}

