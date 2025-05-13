// src/custom-reservations/dto/review-join-request.dto.ts
import { IsString, IsOptional } from 'class-validator';
export class ReviewCustomJoinRequestDto {
  @IsOptional() @IsString() rejectionReason?: string;
}
