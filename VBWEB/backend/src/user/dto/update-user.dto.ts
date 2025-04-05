// src/user/dto/update-user.dto.ts
import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  readonly firstname?: string;

  @IsOptional()
  @IsString()
  readonly lastname?: string;

  @IsOptional()
  @IsString()
  readonly nickname?: string;

  @IsOptional()
  @IsString()
  readonly phone?: string;

  @IsOptional()
  @IsDateString()  // expecting an ISO date string
  readonly birthday?: string;

  @IsOptional()
  @IsString()
  readonly location?: string;

  @IsOptional()
  @IsNumber()
  readonly level?: number;

  @IsOptional()
  @IsString() // or use @IsUrl() if this field contains a URL
  readonly photo?: string;
}
