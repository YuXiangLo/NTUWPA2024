// src/maintainer-applications/admin-review.controller.ts
import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminReviewService } from './admin-review.service';

@Controller('maintainer_applications')
@UseGuards(JwtAuthGuard)
export class AdminReviewController {
  constructor(private readonly reviewService: AdminReviewService) {}

  @Get()
  async getPending(@Request() req) {
    // optionally verify req.user.role === 'admin'
    return this.reviewService.listPending();
  }

  @Patch(':id/approve')
  async approve(@Param('id') id: string, @Request() req) {
    return this.reviewService.updateStatus(id, 'approved', req.user.id);
  }

  @Patch(':id/reject')
  async reject(@Param('id') id: string, @Request() req) {
    return this.reviewService.updateStatus(id, 'rejected', req.user.id);
  }
}