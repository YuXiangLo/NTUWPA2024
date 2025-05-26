// src/reservation-join-requests/reservation-join-requests.service.ts
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
    ConflictException,
  } from '@nestjs/common';
  import { SupabaseService } from '../supabase/supabase.service';
  import { ReviewJoinRequestDto } from './dto/review-join-request.dto';
  
  @Injectable()
  export class ReservationJoinRequestsService {
    constructor(private readonly supabase: SupabaseService) {}
  
    /** 送出加入請求 */
    async createRequest(
      reservationId: string,
      userId: string,
    ) {
      // 0) 防重覆
      const { count, error: cErr } = await this.supabase.client
        .from('reservation_join_requests')
        .select('id', { head: true, count: 'exact' })
        .eq('reservation_id', reservationId)
        .eq('user_id', userId);
      if (cErr) throw new InternalServerErrorException(cErr.message);
      if (count > 0) {
        throw new ConflictException('您已經申請過加入了');
      }
  
      // 1) 檢查 reservation exists 且已 approved
      const { data: resv, error: rErr } = await this.supabase.client
        .from('court_reservations')
        .select('status,user_id,court_id')
        .eq('id', reservationId)
        .single();
      if (rErr || !resv) throw new NotFoundException('預約不存在');
      if (resv.status !== 'approved') {
        throw new ForbiddenException('此預約尚未核准');
      }
  
      // 2) 插入並同時回傳 applicant 的名字
      const { data, error } = await this.supabase.client
        .from('reservation_join_requests')
        .insert([{
          reservation_id: reservationId,
          user_id:        userId,
          status:         'pending',
        }])
        .select(`
          id,
          status,
          requested_at,
          applicant:users!reservation_join_requests_user_id_fkey(
            lastname,
            firstname,
            nickname
          )
        `)
        .single();
  
      if (error) throw new InternalServerErrorException(error.message);
      return data;
    }
  
    /** Hoster(預約擁有者) 列出所有 join requests */
    async listRequests(
      reservationId: string,
    ) {
      // ownership checks omitted for brevity…
    
      const { data, error } = await this.supabase.client
        .from('reservation_join_requests')
        .select(`
          id,
          status,
          requested_at,
          responded_by,
          responded_at,
          rejection_reason,
          applicant:users!reservation_join_requests_user_id_fkey (
            lastname,
            firstname,
            nickname
          )
        `)
        .eq('reservation_id', reservationId);

      if (error) throw new InternalServerErrorException(error.message);
      return data;
    }
  
    /** Hoster 審核 join request */
    async reviewRequest(
      requestId: string,
      userId: string,
      dto: ReviewJoinRequestDto,
      approve: boolean,
    ) {
      // 1) 取得此 request + reservation owner 身分
      const { data: reqRec, error: qErr } = await this.supabase.client
        .from('reservation_join_requests')
        .select('reservation_id')
        .eq('id', requestId)
        .single();
      if (qErr || !reqRec) throw new NotFoundException('請求不存在');
      const { data: resv } = await this.supabase.client
        .from('court_reservations')
        .select('user_id')
        .eq('id', reqRec.reservation_id)
        .single();
      if (resv.user_id !== userId) {
        throw new ForbiddenException('無權審核此加入請求');
      }
  
      // 2) 更新
      const upd = {
        status:           approve ? 'approved' : 'rejected',
        responded_by:     userId,
        responded_at:     new Date().toISOString(),
        rejection_reason: approve ? null : dto.rejectionReason ?? null,
      };
      const { data, error: uErr } = await this.supabase.client
        .from('reservation_join_requests')
        .update(upd)
        .eq('id', requestId)
        .select('*')
        .single();
      if (uErr) throw new InternalServerErrorException(uErr.message);
      return data;
    }
  
    /** 刪除 join request (申請者可撤回) */
    async deleteRequest(
      requestId: string,
      userId: string,
    ) {
      const { data: reqRec, error: qErr } = await this.supabase.client
        .from('reservation_join_requests')
        .select('user_id')
        .eq('id', requestId)
        .single();
      if (qErr || !reqRec) throw new NotFoundException('請求不存在');
      if (reqRec.user_id !== userId) {
        throw new ForbiddenException('無權刪除此請求');
      }
      const { error } = await this.supabase.client
        .from('reservation_join_requests')
        .delete()
        .eq('id', requestId);
      if (error) throw new InternalServerErrorException(error.message);
      return { success: true };
    }

    async listMyRequests(userId: string) {
      const { data, error } = await this.supabase.client
        .from('reservation_join_requests')
        .select(`
          id,
          status,
          requested_at,
          responded_at,
          rejection_reason,
          reservation: court_reservations!reservation_join_requests_reservation_id_fkey (
            id,
            start_ts,
            end_ts,
            num_players,
            fee,
            visibility,
            detail,
            court: courts!court_reservations_court_id_fkey (
              id,
              name,
              venue: venues!courts_venue_id_fkey ( id, name )
            )
          )
        `)
        .eq('user_id', userId);
      if (error) throw new InternalServerErrorException(error.message);
      return data;
    }
  }
  