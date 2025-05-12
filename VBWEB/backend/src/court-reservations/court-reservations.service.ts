// src/court-reservations/court-reservations.service.ts
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    ConflictException,
    InternalServerErrorException,
  } from '@nestjs/common';
  import { SupabaseService } from '../supabase/supabase.service';
  import { CreateCourtReservationDto } from './dto/create-court-reservation.dto';
  import { ReviewCourtReservationDto } from './dto/review-court-reservation.dto';
import e from 'express';
  
  @Injectable()
  export class CourtReservationsService {
    constructor(private readonly supabase: SupabaseService) {}
  
    /** 申請新的 court reservation（檢查無重疊） */
    async createReservation(
      courtId: string,
      userId: string,
      dto: CreateCourtReservationDto,
    ) {
      // 1) 檢查場地存在
      const { data: court, error: cErr } = await this.supabase.client
        .from('courts')
        .select('id')
        .eq('id', courtId)
        .single();
      if (cErr || !court) throw new NotFoundException('球場不存在');
  
      // 2) 檢查是否與現有已核准/待審預約衝突
      const { count, error: ovErr } = await this.supabase.client
        .from('court_reservations')
        .select('id', { count: 'exact', head: true })
        .eq('court_id', courtId)
        .in('status', ['pending','approved'])
        .lt('start_ts', dto.endTs)
        .gt('end_ts', dto.startTs);
      if (ovErr) throw new InternalServerErrorException(ovErr.message);
      if (count > 0) throw new ConflictException('時段已被預約');
  
      // 3) 插入
      const payload = {
        court_id:        courtId,
        user_id:         userId,
        start_ts:        dto.startTs,
        end_ts:          dto.endTs,
        num_players:     dto.numPlayers,
        fee:             dto.fee ?? null,
        visibility:      dto.visibility,
        detail:          dto.detail ?? null,
        status:          'pending'
      };
      const { data, error } = await this.supabase.client
        .from('court_reservations')
        .insert([payload])
        .select('*')
        .single();
      if (error) throw new InternalServerErrorException(error.message);
      return data;
    }
  
    /** 取得單一 court 底下所有申請（維護者專用） */
    async listByCourt(courtId: string, userId: string) {
      // 驗證維護者身分
      const { data: court, error: cErr } = await this.supabase.client
        .from('courts')
        .select('venue_id')
        .eq('id', courtId)
        .single();
      if (cErr || !court) throw new NotFoundException('球場不存在');
      const { data: venue, error: vErr } = await this.supabase.client
        .from('venues')
        .select('maintainer_id')
        .eq('id', court.venue_id)
        .single();
      if (vErr || !venue) throw new NotFoundException('場地不存在');
      if (venue.maintainer_id !== userId) {
        throw new ForbiddenException('無權查看此球場的預約');
      }
  
      const { data, error } = await this.supabase.client
        .from('court_reservations')
        .select(`
          id,
          start_ts,
          end_ts,
          num_players,
          fee,
          visibility,
          detail,
          status,
          submitted_at,
          reviewed_by,
          reviewed_at,
          rejection_reason,
          applicant:users!court_reservations_user_id_fkey (
            lastname,
            firstname,
            nickname
          )
        `)
        .eq('court_id', courtId);

      if (error) throw new InternalServerErrorException(error.message);
      return data;
    }
  
    /** 使用者查看自己的所有申請 */
    async listMyReservations(userId: string) {
      const { data, error } = await this.supabase.client
        .from('court_reservations')
        .select(`
          id,
          start_ts,
          end_ts,
          num_players,
          fee,
          visibility,
          detail,
          status,
          court: courts!court_reservations_court_id_fkey (
            id,
            name,
            venue: venues!courts_venue_id_fkey (
              id,
              name
            )
          )
        `)
        .eq('user_id', userId);
    
      if (error) throw new InternalServerErrorException(error.message);
      return data;
    }
  
    /** 維護者審核：approve 或 reject */
    async reviewReservation(
      reservationId: string,
      userId: string,
      dto: ReviewCourtReservationDto,
      approve: boolean,
    ) {
      // 1) 找到 reservation + 審核者身分檢查
      const { data: resv, error: rErr } = await this.supabase.client
        .from('court_reservations')
        .select('court_id')
        .eq('id', reservationId)
        .single();
      if (rErr || !resv) throw new NotFoundException('預約不存在');
      // 檢查此 court 屬於該維護者
      const { data: court } = await this.supabase.client
        .from('courts')
        .select('venue_id')
        .eq('id', resv.court_id)
        .single();
      const { data: venue } = await this.supabase.client
        .from('venues')
        .select('maintainer_id')
        .eq('id', court.venue_id)
        .single();
      if (venue.maintainer_id !== userId) {
        throw new ForbiddenException('無權審核此預約');
      }
  
      // 2) 更新狀態
      const upd = {
        status:           approve ? 'approved' : 'rejected',
        reviewed_by:      userId,
        reviewed_at:      new Date().toISOString(),
        rejection_reason: approve ? null : dto.rejectionReason ?? null,
      };
      const { data, error: uErr } = await this.supabase.client
        .from('court_reservations')
        .update(upd)
        .eq('id', reservationId)
        .select('*')
        .single();
      if (uErr) throw new InternalServerErrorException(uErr.message);
      return data;
    }
  
    /** 刪除自己的申請（或維護者撤銷） */
    async deleteReservation(reservationId: string, userId: string) {
      // 可加判斷：只有申請者或維護者可刪除
      const { data: resv, error: rErr } = await this.supabase.client
        .from('court_reservations')
        .select('user_id')
        .eq('id', reservationId)
        .single();
      if (rErr || !resv) throw new NotFoundException('預約不存在');
      if (resv.user_id !== userId) {
        throw new ForbiddenException('無權刪除此預約');
      }
      const { error } = await this.supabase.client
        .from('court_reservations')
        .delete()
        .eq('id', reservationId);
      if (error) throw new InternalServerErrorException(error.message);
      return { success: true };
    }

    
  }
  