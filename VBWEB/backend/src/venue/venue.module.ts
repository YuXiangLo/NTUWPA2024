// src/venue/venue.module.ts
import { Module } from '@nestjs/common';
import { VenueService } from './venue.service';
import { VenueController } from './venue.controller';
import { SupabaseService } from 'src/supabase/supabase.service';

@Module({
  controllers: [VenueController],
  providers: [VenueService, SupabaseService], // Ensure SupabaseService is available
})
export class VenueModule {}
