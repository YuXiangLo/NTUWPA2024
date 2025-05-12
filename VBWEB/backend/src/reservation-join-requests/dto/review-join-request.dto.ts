// src/reservation-join-requests/dto/review-join-request.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class ReviewJoinRequestDto {
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
