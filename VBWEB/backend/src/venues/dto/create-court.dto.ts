import { IsString, IsOptional } from 'class-validator';

export class CreateCourtDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  property?: string;

  @IsOptional()
  @IsString()
  detail?: string;
}
