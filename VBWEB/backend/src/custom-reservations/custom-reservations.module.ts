// src/custom-reservations/custom-reservations.module.ts
import { Module } from '@nestjs/common';
import { CustomReservationsController } from './custom-reservations.controller';
import { CustomReservationsService } from './custom-reservations.service';
import { SupabaseService } from '../supabase/supabase.service';

@Module({
  controllers: [CustomReservationsController],
  providers: [CustomReservationsService, SupabaseService],
})
export class CustomReservationsModule {}
