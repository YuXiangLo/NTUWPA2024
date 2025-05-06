// src/maintainer-applications/dto/create-maintainer-application.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class CreateMaintainerApplicationDto {
  @IsString()
  venueName: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  detail?: string;
}
