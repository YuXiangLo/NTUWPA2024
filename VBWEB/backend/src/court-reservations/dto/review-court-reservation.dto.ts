// src/court-reservations/dto/review-court-reservation.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class ReviewCourtReservationDto {
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
