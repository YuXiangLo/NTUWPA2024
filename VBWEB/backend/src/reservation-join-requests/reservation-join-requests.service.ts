// src/reservation-join-requests/reservation-join-requests.service.ts
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
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
      // 檢查 reservation exists 且已 approved
      const { data: resv, error: rErr } = await this.supabase.client
        .from('court_reservations')
        .select('status,user_id,court_id')
        .eq('id', reservationId)
        .single();
      if (rErr || !resv) throw new NotFoundException('預約不存在');
      if (resv.status !== 'approved') {
        throw new ForbiddenException('此預約尚未核准');
      }
  
      // 插入
      const { data, error } = await this.supabase.client
        .from('reservation_join_requests')
        .insert([{
          reservation_id: reservationId,
          user_id:        userId,
          status:         'pending'
        }])
        .select('*')
        .single();
      if (error) throw new InternalServerErrorException(error.message);
      return data;
    }
  
    /** Hoster(預約擁有者) 列出所有 join requests */
    async listRequests(
      reservationId: string,
      userId: string,
    ) {
      // 驗證此 reservation 是他的
      const { data: resv, error: rErr } = await this.supabase.client
        .from('court_reservations')
        .select('user_id')
        .eq('id', reservationId)
        .single();
      if (rErr || !resv) throw new NotFoundException('預約不存在');
      if (resv.user_id !== userId) {
        throw new ForbiddenException('無權查看此加入請求');
      }
      const { data, error } = await this.supabase.client
        .from('reservation_join_requests')
        .select('*')
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
  }
  