// src/auth/dto/refresh-token.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'User refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3NDQxMDEwNjcsImV4cCI6MTc0NDEwNDY2N30.XEmD4NY8EeT-kGiN2DlgtRvhIDgyJH6euvs2IlQe06Q',
  })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
