// src/venue/venue.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { VenueService } from './venue.service';

@Controller('venues')
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  // GET /venues
  @Get()
  async getAllVenues() {
    return await this.venueService.getAllVenues();
  }

  // GET /venues/:id
  @Get(':id')
  async getVenueById(@Param('id') id: string) {
    return await this.venueService.getVenueById(id);
  }
}
