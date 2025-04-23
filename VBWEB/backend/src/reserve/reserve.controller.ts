// src/reserve/reserve.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { CreateReserveDto } from './dto/create-reserve.dto';
import { ReserveService } from './reserve.service';

@Controller('reserve')
export class ReserveController {
  constructor(private readonly reserveService: ReserveService) {}

  @Post()
  async create(@Body() dto: CreateReserveDto) {
    return this.reserveService.createReservation(dto);
  }
}
