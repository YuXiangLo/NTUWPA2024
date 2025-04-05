// src/user/dto/create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDTO {
  @ApiProperty({
    description: 'User Email Address',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User Password',
    example: 'password123',
  })
  @IsNotEmpty()
  @MinLength(6, { message: 'Password is too short. Minimum length is 6 characters.' })
  password: string;
  
}
