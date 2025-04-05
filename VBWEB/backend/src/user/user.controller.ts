// src/user/user.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  Get,
  UseGuards, 
  Req,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
      const user = await this.userService.registerUser(email, password);
      return {
        status: 'success',
        data: user,
      };
    } catch (error) {
      if (error instanceof ConflictException) throw error;
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
      const { accessToken } = await this.userService.loginUser(email, password);
      return {
        status: 'success',
        accessToken,
      };
    } catch (error) {
      if (error.message === 'Invalid credentials' || error.message === 'User not found') {
        throw new UnauthorizedException(error.message);
      }

      throw new InternalServerErrorException('Unexpected error during login');
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 500, description: 'Unexpected server error' })
  async getProfile(@Req() req: Request) {
    const currentUser = (req as Request & { user: any }).user;
    return this.userService.getUserProfileById(currentUser.userid);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 500, description: 'Unexpected server error' })
  async updateProfile(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const currentUser = (req as Request & { user: any }).user;
    const updatedUser = await this.userService.updateUserProfile(currentUser.userid, updateUserDto);
    return updatedUser;
  }
}

