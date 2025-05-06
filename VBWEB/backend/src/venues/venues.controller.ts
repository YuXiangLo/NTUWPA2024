// src/venues/venues.controller.ts
import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VenuesService } from './venues.service';

@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  /** Public: 列出所有已核准 venues */
  @Get()
  getPublicList() {
    return this.venuesService.getAllApprovedVenues();
  }

  /** Private: 列出自己所有 pending & approved venues */
  @UseGuards(JwtAuthGuard)
  @Get('my')            // ← 放在 :id 之前
  getMy(@Request() req: any) {
    const userId = req.user?.userid;
    return this.venuesService.getMyVenues(userId);
  }

  /** Public: 單一 venue 詳細 */
  @Get(':id')
  getPublicDetail(@Param('id') venueId: string) {
    return this.venuesService.getVenueDetail(venueId);
  }

  /** Private: 取得自己某 venue 底下的 courts */
  @UseGuards(JwtAuthGuard)
  @Get(':id/courts')
  getVenueCourts(
    @Param('id') venueId: string,
    @Request() req: any,
  ) {
    const userId = req.user?.userid;
    return this.venuesService.getVenueCourts(venueId, userId);
  }
}