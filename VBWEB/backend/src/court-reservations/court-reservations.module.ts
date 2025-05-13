// src/court-reservations/court-reservations.module.ts
import { Module } from '@nestjs/common';
import { CourtReservationsController } from './court-reservations.controller';
import { CourtReservationsService } from './court-reservations.service';
import { SupabaseService } from '../supabase/supabase.service';

@Module({
  controllers: [CourtReservationsController],
  providers: [CourtReservationsService, SupabaseService],
})
export class CourtReservationsModule {}
