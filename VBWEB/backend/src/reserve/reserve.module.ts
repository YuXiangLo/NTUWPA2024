// src/reserve/reserve.module.ts
import { Module } from '@nestjs/common';
import { ReserveController } from './reserve.controller';
import { ReserveService } from './reserve.service';
import { SupabaseService } from 'src/supabase/supabase.service';

@Module({
  imports: [],
  controllers: [ReserveController],
  providers: [ReserveService, SupabaseService],
})
export class ReserveModule {}
