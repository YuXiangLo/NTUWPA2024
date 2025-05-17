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
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
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
      return { status: 'success', data: user };
    } catch (err) {
      if (err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('Unexpected error during registration');
    }
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 500, description: 'Unexpected server error' })
  async login(@Body() body: LoginDto) {
    const { email, password } = body;
    try {
      const { accessToken, refreshToken, userID } = await this.authService.loginUser(email, password);
      return { status: 'success', accessToken, refreshToken, userID };
    } catch (err) {
      if (err.message === 'User not found' || err.message === 'Invalid credentials') {
        throw new UnauthorizedException(err.message);
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
  async refresh(@Body() body: RefreshTokenDto) {
    const { refreshToken } = body;
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }
    try {
      const { accessToken, refreshToken: newRefresh, userID } =
        await this.authService.refreshAccessToken(refreshToken);
      return { status: 'success', accessToken, refreshToken: newRefresh, userID };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new InternalServerErrorException('Unexpected error during token refresh');
    }
  }

  /**
   * Frontend should redirect to:
   *   https://your-frontend.com/google-callback?credential=<ID_TOKEN>
   * Then that page POSTs JSON { token: <ID_TOKEN> } here.
   */
  @Post('google')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login/register with Google ID token' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'No token provided' })
  @ApiResponse({ status: 401, description: 'Invalid Google token' })
  @ApiResponse({ status: 409, description: 'Email already registered with password' })
  async googleLogin(@Body('token') token: string) {
    if (!token) {
      throw new BadRequestException('Google ID token is required');
    }
    try {
      const { accessToken, refreshToken, userID } = await this.authService.googleLogin(token);
      return { status: 'success', accessToken, refreshToken, userID };
    } catch (err) {
      // Let your service throw ConflictException / UnauthorizedException
      throw err;
    }
  }
}
