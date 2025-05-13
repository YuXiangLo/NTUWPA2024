// src/custom-reservations/custom-reservations.service.ts
import { Injectable, InternalServerErrorException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCustomReservationDto } from './dto/create-custom-reservation.dto';
import { ReviewCustomJoinRequestDto } from './dto/review-join-request.dto';

@Injectable()
export class CustomReservationsService {
  constructor(private readonly supabase: SupabaseService) {}

  // 1) 建立 free-form 預約 (送審)
  async create(dto: CreateCustomReservationDto, userId: string) {
    try {
      const { data, error } = await this.supabase.client
        .from('custom_reservations')
        .insert([{ ...dto, user_id: userId }])
        .select('*').single();
      if (error) throw error;
      return data;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  // 2) 列所有公開/好友的 free-form 預約（含申請狀態 & 人數）
  async listAvailable(userId: string) {
    // load friendIds as before (user_id_1 / user_id_2)
    const { data: fr, error: fe } = await this.supabase.client
      .from('friendships')
      .select('user_id_1,user_id_2')
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
    if (fe) throw new InternalServerErrorException(fe.message);
    const friendIds = fr.map(r => r.user_id_1===userId?r.user_id_2:r.user_id_1);

    // helper to build the two queries
    const baseSelect = `
      id,
      start_ts,
      end_ts,
      num_players,
      fee,
      visibility,
      detail,
      venue_name,
      address,
      court_name,
      court_property,
      applicant:users!custom_reservations_user_id_fkey (
        lastname,firstname,nickname
      ),
      requests: custom_reservation_join_requests!custom_reservation_join_requests_custom_reservation_id_fkey (
        id,user_id,status
      )
    `;

    const pubQ = this.supabase.client
      .from('custom_reservations')
      .select(baseSelect)
      .eq('status','approved')
      .eq('visibility','public');
    const friendQ = this.supabase.client
      .from('custom_reservations')
      .select(baseSelect)
      .eq('visibility','friend')
      .in('user_id', friendIds);

    const [{ data: pd, error: pe },{ data: fd, error: fe2 }] =
      await Promise.all([pubQ, friendQ]);
    if (pe||fe2) throw new InternalServerErrorException((pe||fe2).message);

    const merged = [...(pd||[]),...(fd||[])];
    
    return merged.map((r:any) => {
      const currentPlayers = (r.requests||[]).filter((j:any)=>j.status==='approved').length;
      return { ...r, currentPlayers };
    });
  }

  // 3) 列自己的 free-form 預約
  async listMy(userId: string) {
    const { data, error } = await this.supabase.client
      .from('custom_reservation_join_requests')
      .select(`
        *,
        reservation: custom_reservations!custom_reservation_join_requests_custom_reservation_id_fkey (
          id,
          start_ts,
          end_ts,
          num_players,
          fee,
          visibility,
          detail,
          venue_name,
          address,
          court_name,
          court_property
        )
      `)
      .eq('user_id', userId);
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  // 4) 查看單筆 free-form 預約詳情（host or approved user）
  async getDetail(resvId: string, userId: string) {
    const { data: r, error: re } = await this.supabase.client
      .from('custom_reservations')
      .select(`
        *,
        applicant:users!custom_reservations_user_id_fkey(lastname,firstname,nickname)
      `)
      .eq('id', resvId).single();
    if (re || !r) throw new NotFoundException('不存在');
    // permission as before...
    if (r.user_id!==userId) {
      const { data: jr } = await this.supabase.client
        .from('custom_reservation_join_requests')
        .select('status')
        .eq('custom_reservation_id', resvId)
        .eq('user_id', userId).single();
      if (!jr || jr.status!=='approved') throw new ForbiddenException();
    }
    // load participants
    const { data: parts, error: pe } = await this.supabase.client
      .from('custom_reservation_join_requests')
      .select(`applicant:users!custom_reservation_join_requests_user_id_fkey(lastname,firstname,nickname)`)
      .eq('custom_reservation_id', resvId)
      .eq('status','approved');
    if (pe) throw new InternalServerErrorException(pe.message);
    return { ...r, participants: parts.map(p=>p.applicant) };
  }

  // 5) 送出加入請求
  async createJoinRequest(resvId: string, userId: string) {
    // validate approved, not duplicate, etc.
    const { data, error } = await this.supabase.client
      .from('custom_reservation_join_requests')
      .insert([{ custom_reservation_id: resvId, user_id: userId }])
      .select(`id,status,requested_at`).single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  // 6) Host 列所有 join‐requests
  async listJoinRequests(resvId: string, userId: string) {
    // ownership check...
    const { data, error } = await this.supabase.client
      .from('custom_reservation_join_requests')
      .select(`
        id,
        status,
        requested_at,
        applicant:users!custom_reservation_join_requests_user_id_fkey(lastname,firstname,nickname)
      `)
      .eq('custom_reservation_id', resvId);
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  // 7) Host 審核
  async reviewJoinRequest(
    jrId: string,
    userId: string,
    dto: ReviewCustomJoinRequestDto,
    approve: boolean
  ) {
    // fetch & permission...
    const upd = {
      status: approve?'approved':'rejected',
      responded_by: userId,
      responded_at: new Date().toISOString(),
      rejection_reason: approve?null:dto.rejectionReason,
    };
    const { data, error } = await this.supabase.client
      .from('custom_reservation_join_requests')
      .update(upd).eq('id', jrId)
      .select(`*,
        applicant:users!custom_reservation_join_requests_user_id_fkey(lastname,firstname,nickname)
      `)
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  // (optional) 8) 申請者 撤回
  async deleteJoinRequest(jrId: string, userId: string) {
    // permission + delete...
  }
}
