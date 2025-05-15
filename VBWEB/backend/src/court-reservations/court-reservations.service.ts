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

    async listAvailableReservations(userId: string) {
      // 1) load friendships where user is either side
      const { data: rows, error: fErr } = await this.supabase.client
        .from('friendships')
        .select('user_id_1,user_id_2')
        .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
      if (fErr) throw new InternalServerErrorException(fErr.message);
    
      // 2) build friendIds = the other column
      const friendIds = rows.map(r =>
        r.user_id_1 === userId ? r.user_id_2 : r.user_id_1
      );
    
      // 3) public query
      const publicQ = this.supabase.client
        .from('court_reservations')
        .select(`
          id,
          start_ts,
          end_ts,
          num_players,
          fee,
          visibility,
          detail,
          applicant:users!court_reservations_user_id_fkey (
            lastname,
            firstname,
            nickname
          ),
          court: courts!court_reservations_court_id_fkey (
            id,
            name,
            venue: venues!courts_venue_id_fkey (
              id,
              name
            )
          ),
          requests: reservation_join_requests!reservation_join_requests_reservation_id_fkey (
            id,
            status
          )
        `)
        .eq('status', 'approved')
        .eq('visibility', 'public');
    
      // 4) friend-only query
      const friendQ = this.supabase.client
        .from('court_reservations')
        .select(`
          id,
          start_ts,
          end_ts,
          num_players,
          fee,
          visibility,
          detail,
          applicant:users!court_reservations_user_id_fkey (
            lastname,
            firstname,
            nickname
          ),
          court: courts!court_reservations_court_id_fkey (
            id,
            name,
            venue: venues!courts_venue_id_fkey (
              id,
              name
            )
          ),
          requests: reservation_join_requests!reservation_join_requests_reservation_id_fkey (
            id,
            status
          )
        `)
        .eq('status', 'approved')
        .eq('visibility', 'friend')
        .in('user_id', friendIds);
    
      // 5) execute both
      const [{ data: pubData, error: pubErr }, { data: friData, error: friErr }] =
        await Promise.all([publicQ, friendQ]);
      if (pubErr || friErr) throw new InternalServerErrorException((pubErr || friErr).message);
    
      // 6) merge & compute currentPlayers
      const merged = [...(pubData || []), ...(friData || [])];
      return merged.map(r => {
        const currentPlayers = (r.requests || []).filter(j => j.status === 'approved').length;
        return {
          id:             r.id,
          start_ts:       r.start_ts,
          end_ts:         r.end_ts,
          num_players:    r.num_players,
          fee:            r.fee,
          visibility:     r.visibility,
          detail:         r.detail,
          applicant:      r.applicant,       // { lastname, firstname, nickname }
          court:          r.court,           // { id, name, venue: { id, name }}
          currentPlayers,                     // number
        };
      });
    }

    /** 取得單一 Reservation 的詳細 (host + participants)，權限限 host 或 approved 參加者 */
  async getReservationDetail(reservationId: string, userId: string) {
    // 1) 先抓 reservation 本身 + hoster + court + venue
    const { data: resv, error: rErr } = await this.supabase.client
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
      user_id,
      applicant:users!court_reservations_user_id_fkey(
        lastname,
        firstname,
        nickname
      ),
      court: courts!court_reservations_court_id_fkey(
        id,
        name,
        venue: venues!courts_venue_id_fkey(
          id,
          name,
          address
        )
      )
    `)
    .eq('id', reservationId)
    .single();
    if (rErr || !resv) throw new NotFoundException('Reservation 不存在');

    // 2) 檢查權限：host 或 approved participant 才能看
    if (resv.user_id !== userId) {
      const { data: jr, error: jErr } = await this.supabase.client
        .from('reservation_join_requests')
        .select('status')
        .eq('reservation_id', reservationId)
        .eq('user_id', userId)
        .single();
      if (jErr || !jr || jr.status !== 'approved') {
        throw new ForbiddenException('無權查看此預約詳情');
      }
    }

    // 3) 抓所有 approved 的參加者
    const { data: joiners, error: jErr2 } = await this.supabase.client
      .from('reservation_join_requests')
      .select(`
        id,
        user_id,
        applicant:users!reservation_join_requests_user_id_fkey(
          lastname,
          firstname,
          nickname
        )
      `)
      .eq('reservation_id', reservationId)
      .eq('status', 'approved');
    if (jErr2) throw new InternalServerErrorException(jErr2.message);

    return {
      ...resv,
      venue: {
        id: resv.court.venue.id,
        name: resv.court.venue.name,
        address: resv.court.venue.address,
      },
      participants: joiners.map(j => ({
        id: j.user_id,
        lastname: j.applicant.lastname,
        firstname: j.applicant.firstname,
        nickname: j.applicant.nickname,
      })),
    };
  }
  }
  