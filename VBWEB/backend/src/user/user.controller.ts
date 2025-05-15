// src/user/user.controller.ts
import {
  Controller, Get, Patch, Post,
  UseGuards, UseInterceptors,
  UploadedFile, Req, Body,
  InternalServerErrorException,
  BadRequestException, HttpException, HttpStatus
} from '@nestjs/common';
import { Request, Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';
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
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async getProfile(@Req() req: Request) {
    try {
      const uid = (req.user as any).userid;
      if (!uid) throw new BadRequestException('Missing user ID');
      return await this.userService.getUserInfoByUserID(uid);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async updateProfile(
    @Req() req: Request,
    @Body() updateUserDto: UpdateUserDto
  ) {
    try {
      const uid = (req.user as any).userid;
      if (!uid) throw new BadRequestException('Missing user ID');
      return await this.userService.updateUserProfile(uid, updateUserDto);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  @Post('photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('photo', {
    limits: { fileSize: 1 * 1024 * 1024 }, // 1 MB
    fileFilter(_req, file, cb) {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new BadRequestException('Only image files allowed'), false);
      }
      cb(null, true);
    }
  }))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Upload or update user photo' })
  @ApiResponse({ status: 200, description: 'Photo uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request
  ) {
    console.log('Uploading photo...');
    try {
      const uid = (req.user as any).userid;
      if (!uid) throw new BadRequestException('Missing user ID');
      // 這裡回傳完整更新後的使用者資料
      return await this.userService.uploadUserPhoto(uid, file);
    } catch (err) {
      throw new HttpException(
        err.message,
        err instanceof HttpException
          ? err.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('isadmin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Check if current user is admin' })
  @ApiResponse({ status: 200, description: 'User is admin' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async isAdmin(@Req() req: Request) {
    try {
      const uid = (req.user as any).userid;
      if (!uid) throw new BadRequestException('Missing user ID');
      return await this.userService.isAdmin(uid);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
