// src/court-reservations/court-reservations.controller.ts
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
    Query,
  } from '@nestjs/common';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { CourtReservationsService } from './court-reservations.service';
  import { CreateCourtReservationDto } from './dto/create-court-reservation.dto';
  import { ReviewCourtReservationDto } from './dto/review-court-reservation.dto';
  
  @Controller()
  @UseGuards(JwtAuthGuard)
  export class CourtReservationsController {
    constructor(private readonly service: CourtReservationsService) {}
  
    /** 申請預約 */
    @Post('venues/:venueId/courts/:courtId/reservations')
    create(
      @Param('courtId') courtId: string,
      @Body() dto: CreateCourtReservationDto,
      @Request() req: any
    ) {
      return this.service.createReservation(courtId, req.user.userid, dto);
    }
  
    /** 維護者：列出某 court 的所有申請 */
    @Get('courts/:courtId/reservations')
    listByCourt(
      @Param('courtId') courtId: string,
      @Request() req: any
    ) {
      return this.service.listByCourt(courtId, req.user.userid);
    }
  
    /** 使用者：查看自己所有申請 */
    @Get('reservations/my')
    listMy(@Request() req: any) {
      return this.service.listMyReservations(req.user.userid);
    }
  
    /** 維護者：approve */
    @Patch('reservations/:id/approve')
    approve(
      @Param('id') id: string,
      @Request() req: any
    ) {
      return this.service.reviewReservation(
        id,
        req.user.userid,
        {},
        true
      );
    }
  
    /** 維護者：reject */
    @Patch('reservations/:id/reject')
    reject(
      @Param('id') id: string,
      @Body() dto: ReviewCourtReservationDto,
      @Request() req: any
    ) {
      return this.service.reviewReservation(
        id,
        req.user.userid,
        dto,
        false
      );
    }
  
    /** 刪除申請 */
    @Delete('reservations/:id')
    remove(
      @Param('id') id: string,
      @Request() req: any
    ) {
      return this.service.deleteReservation(id, req.user.userid);
    }

    @Get('reservations/available')
    listAvailable(@Request() req: any) {
      return this.service.listAvailableReservations(req.user.userid);
    }
  }
  