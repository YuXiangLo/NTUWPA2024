// src/reserve/reserve.controller.ts
import { Controller, Post, Body, Get, Param, Query  } from '@nestjs/common';
import { CreateReserveDto } from './dto/create-reserve.dto';
import { ReserveService } from './reserve.service';

@Controller('reserve')
export class ReserveController {
  constructor(private readonly reserveService: ReserveService) {}

  @Post()
  async create(@Body() dto: CreateReserveDto) {
    return this.reserveService.createReservation(dto);
  }

  @Get('court/:court_id')
  async getByCourt(
    @Param('court_id') court_id: string,
    @Query('start') start: string,
    @Query('end') end: string
  ) {
    return this.reserveService.getReservationsForCourt(court_id, start, end);
  }
}
