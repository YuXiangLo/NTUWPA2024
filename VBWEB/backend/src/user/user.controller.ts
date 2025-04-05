// src/user/user.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  UseGuards, 
  Req,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { LoginDTO } from './dto/LoginDTO';
import { RegisterDTO } from './dto/RegisterDTO';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Missing or invalid input' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 500, description: 'Unexpected server error' })
  async register(@Body() body: RegisterDTO) {
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
  async login(@Body() body: LoginDTO) {
    const { email, password } = body;

    try {
      const { accessToken } = await this.userService.loginUser(email, password);
      return {
        status: 'success',
		statusCode: 200,
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
  @UseGuards(JwtAuthGuard)  // Only allow authenticated users
  async getProfile(@Req() req: Request) {
    const currentUser = (req as Request & { user: any }).user;
    return this.userService.getUserProfileById(currentUser.userid);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const currentUser = (req as Request & { user: any }).user;
    const updatedUser = await this.userService.updateUserProfile(currentUser.userid, updateUserDto);
    return updatedUser;
  }

  @Get('emails')
  @HttpCode(200)
  @ApiResponse({ status: 200, description: 'Fetch successful' })
  @ApiResponse({ status: 500, description: 'Unexpected server error' })
  @ApiOperation({ summary: 'Fetch all registered emails' })
  async getAllEmails() {
    return this.userService.getAllRegisteredEmails();
  }
}

