// src/maintainer-applications/admin-review.controller.ts
import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminReviewService } from './admin-review.service';

@Controller('maintainer_applications')    // was 'api/maintainer_applications'
@UseGuards(JwtAuthGuard)
export class AdminReviewController {
  constructor(private readonly reviewService: AdminReviewService) {}

  @Get()
  async getPending(@Request() req) {
    return this.reviewService.listPending();
  }

  @Patch(':id/approve')
  async approve(
    @Param('id') id: string,
    @Body() body: { longitude: number; latitude: number },
    @Request() req,
  ) {
    return this.reviewService.updateStatus(
      id,
      'approved',
      req.user.id,
      body,
    );
  }

  @Patch(':id/reject')
  async reject(@Param('id') id: string, @Request() req) {
    return this.reviewService.updateStatus(
      id,
      'rejected',
      req.user.id,
    );
  }
}