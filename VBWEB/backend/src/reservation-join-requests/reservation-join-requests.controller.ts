// src/reservation-join-requests/reservation-join-requests.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReservationJoinRequestsService } from './reservation-join-requests.service';
import { ReviewJoinRequestDto } from './dto/review-join-request.dto';

@Controller()
export class ReservationJoinRequestsController {
  constructor(
    private readonly service: ReservationJoinRequestsService
  ) {}

  /** 送出加入請求 */
  @UseGuards(JwtAuthGuard)
  @Post('reservations/:reservationId/join-requests')
  create(
    @Param('reservationId') reservationId: string,
    @Request() req: any
  ) {
    return this.service.createRequest(reservationId, req.user.userid);
  }

  
  /** Hoster: 列出所有 join requests */
  @Get('reservations/:reservationId/join-requests')
  list(
    @Param('reservationId') reservationId: string,
  ) {
    return this.service.listRequests(reservationId);
  }

  /** Hoster: approve */
  @UseGuards(JwtAuthGuard)
  @Patch('join-requests/:id/approve')
  approve(
    @Param('id') id: string,
    @Request() req: any
  ) {
    return this.service.reviewRequest(id, req.user.userid, {}, true);
  }

  /** Hoster: reject */
  @UseGuards(JwtAuthGuard)
  @Patch('join-requests/:id/reject')
  reject(
    @Param('id') id: string,
    @Body() dto: ReviewJoinRequestDto,
    @Request() req: any
  ) {
    return this.service.reviewRequest(id, req.user.userid, dto, false);
  }

  /** 申請者／Hoster：刪除請求 */
@UseGuards(JwtAuthGuard)
  @Delete('join-requests/:id')
  remove(
    @Param('id') id: string,
    @Request() req: any
  ) {
    return this.service.deleteRequest(id, req.user.userid);
  }

  @UseGuards(JwtAuthGuard)
  @Get('join-requests/my')
  listMy(@Request() req: any) {
    return this.service.listMyRequests(req.user.userid);
  }
}
