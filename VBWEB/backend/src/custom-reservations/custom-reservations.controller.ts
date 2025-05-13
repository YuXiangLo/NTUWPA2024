// src/custom-reservations/custom-reservations.controller.ts
import {
  Controller, Post, Get, Patch, Param, Body, UseGuards, Request
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CustomReservationsService } from './custom-reservations.service';
import { CreateCustomReservationDto } from './dto/create-custom-reservation.dto';
import { ReviewCustomJoinRequestDto } from './dto/review-join-request.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class CustomReservationsController {
  constructor(private svc: CustomReservationsService) {}

  @Post('custom-reservations')
  create(@Body() dto: CreateCustomReservationDto, @Request() req) {
    return this.svc.create(dto, req.user.userid);
  }

  @Get('custom-reservations/available')
  listAvailable(@Request() req) {
    return this.svc.listAvailable(req.user.userid);
  }

  @Get('custom-reservations/my')
  listMy(@Request() req) {
    return this.svc.listMy(req.user.userid);
  }

  @Get('custom-reservations/:id')
  detail(@Param('id') id: string, @Request() req) {
    return this.svc.getDetail(id, req.user.userid);
  }

  @Post('custom-reservations/:id/join-requests')
  createJR(@Param('id') id:string, @Request() req) {
    return this.svc.createJoinRequest(id, req.user.userid);
  }

  @Get('custom-reservations/:id/join-requests')
  listJR(@Param('id') id:string, @Request() req) {
    return this.svc.listJoinRequests(id, req.user.userid);
  }

  @Patch('custom-reservations/join-requests/:jrId/approve')
  approveJR(
    @Param('jrId') jrId: string,
    @Body() dto: ReviewCustomJoinRequestDto,
    @Request() req
  ) {
    return this.svc.reviewJoinRequest(jrId, req.user.userid, dto, true);
  }

  @Patch('custom-reservations/join-requests/:jrId/reject')
  rejectJR(
    @Param('jrId') jrId: string,
    @Body() dto: ReviewCustomJoinRequestDto,
    @Request() req
  ) {
    return this.svc.reviewJoinRequest(jrId, req.user.userid, dto, false);
  }
}
