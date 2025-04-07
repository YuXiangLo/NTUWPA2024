// src/user/user.controller.ts

import {
  Controller,
  Get,
  UseGuards,
  Req,
  Patch,
  Body,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 500, description: 'Unexpected server error' })
  async getProfile(@Req() req: Request) {
    try {
      const currentUser = (req as Request & { user: any }).user;
      return this.userService.getUserProfileById(currentUser.userid);
    } catch (error) {
      throw new InternalServerErrorException('Unexpected error while getting profile');
    }
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
    try {
      const currentUser = (req as Request & { user: any }).user;
      return this.userService.updateUserProfile(currentUser.userid, updateUserDto);
    } catch (error) {
      throw new InternalServerErrorException('Unexpected error while updating profile');
    }
  }
}
