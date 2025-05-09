// src/venues/venues.controller.ts
import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  Post,
  Body,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VenuesService } from './venues.service';
import { CreateCourtDto } from './dto/create-court.dto';

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

  /** Private: 在 venue 下建立新的 court */
  @UseGuards(JwtAuthGuard)
  @Post(':id/courts')
  async createCourt(
    @Param('id') venueId: string,
    @Body() dto: CreateCourtDto,
    @Request() req: any,
  ) {
    const userId = req.user?.userid;
    return this.venuesService.createCourt(venueId, userId, dto);
  }

  /** Private: 刪除指定 court（範例） */
  @UseGuards(JwtAuthGuard)
  @Delete(':venueId/courts/:courtId')
  async deleteCourt(
    @Param('venueId') venueId: string,
    @Param('courtId') courtId: string,
    @Request() req: any,
  ) {
    // 可以依照你的需求實作 deleteCourt in service
    const userId = req.user?.userid;
    return this.venuesService.deleteCourt(venueId, courtId, userId);
  }

}