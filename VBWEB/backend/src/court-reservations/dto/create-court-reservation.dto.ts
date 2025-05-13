// src/court-reservations/dto/create-court-reservation.dto.ts
import { IsUUID, IsISO8601, IsInt, Min, IsOptional, IsNumber, IsIn, IsString } from 'class-validator';

export class CreateCourtReservationDto {
  @IsISO8601()
  startTs: string;      // e.g. "2025-10-06T11:00:00Z"

  @IsISO8601()
  endTs: string;

  @IsInt()
  @Min(1)
  numPlayers: number;

  @IsOptional()
  @IsNumber()
  fee?: number;

  @IsIn(['public','private','friend'])
  visibility: 'public' | 'private' | 'friend';

  @IsOptional()
  @IsString()
  detail?: string;
}
