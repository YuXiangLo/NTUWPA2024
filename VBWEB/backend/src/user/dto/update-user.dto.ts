// src/user/dto/update-user.dto.ts
import { IsOptional, IsString, IsNumber, IsDateString, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Sping' })
  @IsOptional()
  @IsString()
  readonly firstname?: string;

  @ApiPropertyOptional({ example: 'Yang' })
  @IsOptional()
  @IsString()
  readonly lastname?: string;

  @ApiPropertyOptional({ example: 'HandsomeBoy' })
  @IsOptional()
  @IsString()
  readonly nickname?: string;

  @ApiPropertyOptional({ example: '0912-345-678' })
  @IsOptional()
  @IsString()
  readonly phone?: string;

  @ApiPropertyOptional({ example: '2003-05-03' })
  @IsOptional()
  @IsDateString()
  readonly birthday?: string;

  @ApiPropertyOptional({ example: 'Taipei, Taiwan' })
  @IsOptional()
  @IsString()
  readonly location?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Type(() => Number)
  readonly level?: number;

  @ApiPropertyOptional({ example: 'https://example.com/photos/HandsomeBoy.jpg' })
  @IsOptional()
  @IsUrl()
  readonly photo?: string;
}
