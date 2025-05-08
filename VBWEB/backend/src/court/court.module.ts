import { Module } from '@nestjs/common';
import { CourtController } from './court.controller';
import { CourtService } from './court.service';
import { SupabaseService } from '../supabase/supabase.service';

@Module({
  controllers: [CourtController],
  providers: [CourtService, SupabaseService],
})
export class CourtModule {}
