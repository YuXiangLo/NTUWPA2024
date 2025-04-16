// src/court/court.module.ts
import { Module } from '@nestjs/common';
import { CourtController } from './court.controller';
import { VenueService } from 'src/venue/venue.service';
import { SupabaseService } from 'src/supabase/supabase.service';

@Module({
  controllers: [CourtController],
  providers: [VenueService, SupabaseService],
  // Remove exports, since controllers aren't meant to be exported.
})
export class CourtModule {}
