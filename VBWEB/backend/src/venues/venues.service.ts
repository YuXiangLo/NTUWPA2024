import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCourtDto } from './dto/create-court.dto';

@Injectable()
export class VenuesService {
  constructor(private readonly supabase: SupabaseService) {}

  async getMyVenues(userId: string) {
    try {
      // 1) Pending applications (courtCount = 0)
      const { data: apps, error: appsErr } = await this.supabase.client
        .from('maintainer_applications')
        .select('id, venue_name, status')
        .eq('user_id', userId)
        .eq('status', 'pending');
      if (appsErr) throw appsErr;

      const pending = apps!.map(a => ({
        id:         a.id,
        name:       a.venue_name,
        status:     a.status,
        courtCount: 0,
      }));

      // 2) Approved venues + count courts
      const { data: venues, error: venuesErr } = await this.supabase.client
        .from('venues')
        .select('id, name')
        .eq('maintainer_id', userId);
      if (venuesErr) throw venuesErr;

      // For each venue, head-only select to get exact count of courts
      const approved = await Promise.all(
        venues!.map(async v => {
          const { count, error: cErr } = await this.supabase.client
            .from('courts')
            .select('id', { count: 'exact', head: true })
            .eq('venue_id', v.id);
          if (cErr) throw cErr;
          return {
            id:         v.id,
            name:       v.name,
            status:     'approved',
            courtCount: count || 0,
          };
        })
      );

      return [...pending, ...approved];
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  /** 列出公開所有已核准的 venues （不需登入） */
  async getAllApprovedVenues() {
    const { data, error } = await this.supabase.client
      .from('venues')
      .select('id, name, address, phone, location');
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  /** 查單一公開 venue 詳細（含 courts + opening hours） */
  async getVenueDetail(venueId: string) {
    // 基本資料
    const { data: venue, error: vErr } = await this.supabase.client
      .from('venues')
      .select('id, name, address, phone, detail, location')
      .eq('id', venueId)
      .single();
    if (vErr) throw new NotFoundException('場地不存在');

    // courts + hours
    const { data: courts, error: cErr } = await this.supabase.client
      .from('courts')
      .select(`
        id,
        name,
        property,
        opening_hours: court_opening_hours (
          day_of_week,
          open_time,
          close_time
        )
      `)
      .eq('venue_id', venueId);
    if (cErr) throw new InternalServerErrorException(cErr.message);

    return { ...venue, courts };
  }

  /** 私人：維護者取自己某 venue id 底下的 courts（含 hours） */
  async getVenueCourts(venueId: string, userId: string) {
    // 驗證 venue 所屬
    const { data: venue, error: vErr } = await this.supabase.client
      .from('venues')
      .select('maintainer_id')
      .eq('id', venueId)
      .single();
    if (vErr) throw new NotFoundException('場地不存在');
    if (venue.maintainer_id !== userId) {
      throw new ForbiddenException('你沒有權限查看此場地的球場');
    }

    // 取 courts + hours
    const { data: courts, error: cErr } = await this.supabase.client
      .from('courts')
      .select(`
        id,
        name,
        property,
        opening_hours: court_opening_hours (
          day_of_week,
          open_time,
          close_time
        )
      `)
      .eq('venue_id', venueId);
    if (cErr) throw new InternalServerErrorException(cErr.message);

    return courts;
  }

  /** 在已核准的 venue 底下新增 court */
  async createCourt(
    venueId: string,
    userId: string,
    dto: CreateCourtDto,
  ) {
    // 1) 驗證 venue 存在且屬於此 user
    const { data: venue, error: vErr } = await this.supabase.client
      .from('venues')
      .select('maintainer_id')
      .eq('id', venueId)
      .single();
    if (vErr) throw new NotFoundException('場地不存在');
    if (venue.maintainer_id !== userId) {
      throw new ForbiddenException('你沒有權限為此場地新增球場');
    }

    // 2) 插入新的 court
    const payload = {
      venue_id: venueId,
      name:     dto.name,
      property: dto.property || null,
      detail:   dto.detail || null,
    };

    const { data, error } = await this.supabase.client
      .from('courts')
      .insert([payload])
      .select('*')
      .single();
    if (error) throw new InternalServerErrorException(error.message);

    return data;
  }

  async deleteCourt(
    venueId: string,
    courtId: string,
    userId: string,
  ): Promise<{ success: boolean }> {
    // 1) 驗證 venue 存在且屬於此 user
    const { data: venue, error: vErr } = await this.supabase.client
      .from('venues')
      .select('maintainer_id')
      .eq('id', venueId)
      .single();
    if (vErr) throw new NotFoundException('場地不存在');
    if (venue.maintainer_id !== userId) {
      throw new ForbiddenException('你沒有權限刪除此場地下的球場');
    }

    // 2) 驗證 court 存在且屬於此 venue
    const { data: court, error: cErr } = await this.supabase.client
      .from('courts')
      .select('id')
      .eq('id', courtId)
      .eq('venue_id', venueId)
      .single();
    if (cErr) throw new NotFoundException('球場不存在或不屬於此場地');

    // 3) 刪除 court（與其 opening_hours 會自動 cascade）
    const { error: delErr } = await this.supabase.client
      .from('courts')
      .delete()
      .eq('id', courtId)
      .eq('venue_id', venueId);
    if (delErr) {
      throw new InternalServerErrorException('刪除失敗：' + delErr.message);
    }

    return { success: true };
  }

}
