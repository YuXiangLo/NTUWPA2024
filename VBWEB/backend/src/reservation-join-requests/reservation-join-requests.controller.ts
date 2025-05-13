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
@UseGuards(JwtAuthGuard)
export class ReservationJoinRequestsController {
  constructor(
    private readonly service: ReservationJoinRequestsService
  ) {}

  /** 送出加入請求 */
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
    @Request() req: any
  ) {
    return this.service.listRequests(reservationId, req.user.userid);
  }

  /** Hoster: approve */
  @Patch('join-requests/:id/approve')
  approve(
    @Param('id') id: string,
    @Request() req: any
  ) {
    return this.service.reviewRequest(id, req.user.userid, {}, true);
  }

  /** Hoster: reject */
  @Patch('join-requests/:id/reject')
  reject(
    @Param('id') id: string,
    @Body() dto: ReviewJoinRequestDto,
    @Request() req: any
  ) {
    return this.service.reviewRequest(id, req.user.userid, dto, false);
  }

  /** 申請者／Hoster：刪除請求 */
  @Delete('join-requests/:id')
  remove(
    @Param('id') id: string,
    @Request() req: any
  ) {
    return this.service.deleteRequest(id, req.user.userid);
  }

  @Get('join-requests/my')
  listMy(@Request() req: any) {
    return this.service.listMyRequests(req.user.userid);
  }
}
