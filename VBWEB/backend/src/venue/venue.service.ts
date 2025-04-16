// src/venue/venue.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class VenueService {
  constructor(private readonly supabaseService: SupabaseService) {}

  // Query all venues along with their related court information.
  async getAllVenues(): Promise<any[]> {
    // Use the Supabase client to perform a join query.
    const { data, error } = await this.supabaseService.client
      .from('venue')
      .select(`*, court (*)`);
    if (error) {
      throw new BadRequestException(`Failed to fetch venues: ${error.message}`);
    }
    return data;
  }

  // Query a specific venue by its id and include nested court information.
  async getVenueById(venueId: string): Promise<any> {
    const { data, error } = await this.supabaseService.client
      .from('venue')
      .select(`*, court (*)`)
      .eq('venue_id', venueId)
      .maybeSingle();
    if (error) {
      throw new BadRequestException(`Failed to fetch venue: ${error.message}`);
    }
    if (!data) {
      throw new NotFoundException('Venue not found.');
    }
    return data;
  }

  // Query a specific court by its court_id.
  async getCourtById(courtId: string): Promise<any> {
    const { data, error } = await this.supabaseService.client
      .from('court')
      .select('*')
      .eq('court_id', courtId)
      .maybeSingle();
    if (error) {
      throw new BadRequestException(`Failed to fetch court: ${error.message}`);
    }
    if (!data) {
      throw new NotFoundException('Court not found.');
    }
    return data;
  }
}
