import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
  } from '@nestjs/common';
  import { SupabaseService } from '../supabase/supabase.service';
  import { CreateOpeningHourDto } from './dto/create-opening-hour.dto';
  import { UpdateOpeningHourDto } from './dto/update-opening-hour.dto';
  
  @Injectable()
  export class CourtService {
    constructor(private readonly supabase: SupabaseService) {}
  
    private async ensureCourtBelongsToUser(courtId: string, userId: string) {
      // 1) get court → venue_id
      const { data: court, error: cErr } = await this.supabase.client
        .from('courts')
        .select('venue_id')
        .eq('id', courtId)
        .single();
      if (cErr || !court) {
        throw new NotFoundException('球場不存在');
      }
      // 2) get venue → maintainer_id
      const { data: venue, error: vErr } = await this.supabase.client
        .from('venues')
        .select('maintainer_id')
        .eq('id', court.venue_id)
        .single();
      if (vErr || !venue) {
        throw new NotFoundException('場地不存在');
      }
      if (venue.maintainer_id !== userId) {
        throw new ForbiddenException('無權管理此球場時段');
      }
    }
  
    async getOpeningHours(courtId: string, userId: string) {
      await this.ensureCourtBelongsToUser(courtId, userId);
      const { data, error } = await this.supabase.client
        .from('court_opening_hours')
        .select('*')
        .eq('court_id', courtId);
      if (error) {
        throw new InternalServerErrorException(error.message);
      }
      return data;
    }
  
    async createOpeningHour(
      courtId: string,
      userId: string,
      dto: CreateOpeningHourDto,
    ) {
      await this.ensureCourtBelongsToUser(courtId, userId);
      const payload = {
        court_id:    courtId,
        day_of_week: dto.dayOfWeek,
        open_time:   dto.openTime,
        close_time:  dto.closeTime,
      };
      const { data, error } = await this.supabase.client
        .from('court_opening_hours')
        .insert([payload])
        .select('*')
        .single();
      if (error) {
        throw new InternalServerErrorException(error.message);
      }
      return data;
    }
  
    async updateOpeningHour(
      courtId: string,
      ohId: string,
      userId: string,
      dto: UpdateOpeningHourDto,
    ) {
      await this.ensureCourtBelongsToUser(courtId, userId);
      const { error } = await this.supabase.client
        .from('court_opening_hours')
        .update({
          day_of_week: dto.dayOfWeek,
          open_time:   dto.openTime,
          close_time:  dto.closeTime,
        })
        .eq('id', ohId)
        .eq('court_id', courtId);
      if (error) {
        throw new InternalServerErrorException(error.message);
      }
      return { success: true };
    }
  
    async deleteOpeningHour(
      courtId: string,
      ohId: string,
      userId: string,
    ) {
      await this.ensureCourtBelongsToUser(courtId, userId);
      const { error } = await this.supabase.client
        .from('court_opening_hours')
        .delete()
        .eq('id', ohId)
        .eq('court_id', courtId);
      if (error) {
        throw new InternalServerErrorException(error.message);
      }
      return { success: true };
    }

    async bulkCreateOpeningHours(
      courtId: string,
      userId: string,
      periods: CreateOpeningHourDto[],
    ) {
      await this.ensureCourtBelongsToUser(courtId, userId);
  
      // 1) Delete all
      const { error: delErr } = await this.supabase.client
        .from('court_opening_hours')
        .delete()
        .eq('court_id', courtId);
      if (delErr) throw new InternalServerErrorException(delErr.message);
  
      // 2) Insert new
      const payload = periods.map(p => ({
        court_id:    courtId,
        day_of_week: p.dayOfWeek,
        open_time:   p.openTime,
        close_time:  p.closeTime,
      }));
      const { data, error: insErr } = await this.supabase.client
        .from('court_opening_hours')
        .insert(payload)
        .select('*');
      if (insErr) throw new InternalServerErrorException(insErr.message);
  
      return data;
    }
  }
  