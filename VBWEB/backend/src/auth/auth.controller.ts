// src/auth/auth.controller.ts

import {
    Controller,
    Post,
    Body,
    HttpCode,
    BadRequestException,
    UnauthorizedException,
    ConflictException,
    InternalServerErrorException,
  } from '@nestjs/common';
  import { AuthService } from './auth.service';
  import { CreateUserDto } from './dto/create-user.dto';
  import { RefreshTokenDto } from './dto/refresh-token.dto';
  import { LoginDto } from './dto/login.dto';
  import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
  
  @ApiTags('auth')
  @Controller('auth')
  export class AuthController {
    constructor(private readonly authService: AuthService) {}
  
    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User successfully registered' })
    @ApiResponse({ status: 400, description: 'Missing or invalid input' })
    @ApiResponse({ status: 409, description: 'User already exists' })
    @ApiResponse({ status: 500, description: 'Unexpected server error' })
    async register(@Body() body: CreateUserDto) {
      const { email, password } = body;
  
      if (!email || !password) {
        throw new BadRequestException('Email and password are required');
      }
  
      try {
        const user = await this.authService.registerUser(email, password);
        return {
          status: 'success',
          data: user,
        };
      } catch (error) {
        if (error instanceof ConflictException) {
          throw error;
        }
        throw new InternalServerErrorException('Unexpected error during registration');
      }
    }
  
    @Post('login')
    @HttpCode(200)
    @ApiOperation({ summary: 'Login a user' })
    @ApiResponse({ status: 200, description: 'Login successful' })
    @ApiResponse({ status: 400, description: 'Invalid property' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    @ApiResponse({ status: 500, description: 'Unexpected server error' })
    async login(@Body() body: LoginDto) {
      const { email, password } = body;
  
      try {
        const { accessToken, refreshToken } = await this.authService.loginUser(email, password);
        return {
          status: 'success',
          accessToken,
          refreshToken
        };
      } catch (error) {
        if (error.message === 'Invalid credentials' || error.message === 'User not found') {
          throw new UnauthorizedException(error.message);
        }
        throw new InternalServerErrorException('Unexpected error during login');
      }
    }

    @Post('refresh-token')
    @HttpCode(200)
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiResponse({ status: 200, description: 'Access token refreshed' })
    @ApiResponse({ status: 401, description: 'Invalid refresh token' })
    @ApiResponse({ status: 500, description: 'Unexpected server error' })
    async refreshToken(@Body() body: RefreshTokenDto) {
      const { refreshToken: oldRefreshToken } = body;

      if (!oldRefreshToken) {
        throw new BadRequestException('Refresh token is required');
      }

      try {
        const { accessToken, refreshToken } = await this.authService.refreshAccessToken(oldRefreshToken);
        return {
          status: 'success',
          accessToken,
          refreshToken,
        };
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          throw error;
        }
        throw new InternalServerErrorException('Unexpected error during token refresh');
      }
    }
  }
  