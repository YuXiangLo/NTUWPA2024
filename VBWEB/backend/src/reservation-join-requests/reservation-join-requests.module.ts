// src/reservation-join-requests/reservation-join-requests.module.ts
import { Module } from '@nestjs/common';
import { ReservationJoinRequestsController } from './reservation-join-requests.controller';
import { ReservationJoinRequestsService } from './reservation-join-requests.service';
import { SupabaseService } from '../supabase/supabase.service';

@Module({
  controllers: [ReservationJoinRequestsController],
  providers: [ReservationJoinRequestsService, SupabaseService],
})
export class ReservationJoinRequestsModule {}
