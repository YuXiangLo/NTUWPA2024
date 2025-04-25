// src/reserve/reserve.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { CreateReserveDto } from './dto/create-reserve.dto';

@Injectable()
export class ReserveService {
  constructor(private readonly supabase: SupabaseService) {}

  async createReservation(dto: CreateReserveDto) {

    const rows = dto.slots.map(slot => ({
      user_id: dto.user_id,
      venue_id: dto.venue_id,
      court_id: dto.court_id,
      start_time: `${slot.date}T${slot.time}:00Z`,
      end_time:   `${slot.date}T${slot.time}:00Z`, // or compute end
      cur_male_count: dto.cur_male_count,
      max_male_count: dto.max_male_count,
      cur_female_count: dto.cur_female_count,
      max_female_count: dto.max_female_count,
      privacy_type: dto.privacy_type,
      level: dto.level,
      fee: dto.fee,
      remark: dto.remark,
    }));

    const { data, error } = await this.supabase.client
      .from('reserve')
      .insert(rows);

    if (error) {
      throw new BadRequestException(`Failed to create reservation: ${error.message}`);
    }
    return data;
  }

  // New: get all reservations for a court within a date range
  async getReservationsForCourt(
    court_id: string,
    start: string,   // ISO date: 'YYYY-MM-DD'
    end: string      // ISO date: 'YYYY-MM-DD'
  ): Promise<any[]> {
    const startTs = `${start}T00:00:00Z`;
    const endTs   = `${end}T23:59:59Z`;

    const { data, error } = await this.supabase.client
      .from('reserve')
      .select('start_time, user_id')
      .eq('court_id', court_id)
      .gte('start_time', startTs)
      .lte('start_time', endTs);

    if (error) {
      throw new BadRequestException(`Failed to fetch reservations: ${error.message}`);
    }
    return data;
  }
}
