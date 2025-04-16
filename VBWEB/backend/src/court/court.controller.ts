// src/court/court.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { VenueService } from 'src/venue/venue.service';

@Controller('courts')
export class CourtController {
  constructor(private readonly venueService: VenueService) {}

  @Get(':court_id')
  async getCourtById(@Param('court_id') court_id: string) {
    // This method calls the getCourtById defined in VenueService which queries Supabase.
    return await this.venueService.getCourtById(court_id);
  }

  @Get('court-venue-name/:court_id')
  async getCourtVenueNameById(@Param('court_id') court_id: string) {
    return await this.venueService.getCourtVenueNameById(court_id);
  }
}
