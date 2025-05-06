// src/venue/venue.module.ts
import { Module } from '@nestjs/common';
import { VenuesService } from './venues.service';
import { VenuesController } from './venues.controller';
import { SupabaseService } from 'src/supabase/supabase.service';

@Module({
  controllers: [VenuesController],
  providers: [VenuesService, SupabaseService], // Ensure SupabaseService is available
})
export class VenuesModule {}
