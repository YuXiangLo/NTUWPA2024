import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class VenuesService {
  constructor(private readonly supabase: SupabaseService) {}

  /** 列出當前使用者自己所有 venue（pending apps + approved venues） */
  async getMyVenues(userId: string) {
    try {
      // pending applications
      const { data: apps, error: appsErr } = await this.supabase.client
        .from('maintainer_applications')
        .select('id, venue_name, status')
        .eq('user_id', userId);
      if (appsErr) throw appsErr;

      const pending = (apps || []).map(a => ({
        id: a.id,
        name: a.venue_name,
        status: a.status,
      }));

      // approved venues
      const { data: venues, error: venuesErr } = await this.supabase.client
        .from('venues')
        .select('id, name')
        .eq('maintainer_id', userId);
      if (venuesErr) throw venuesErr;

      const approved = (venues || []).map(v => ({
        id: v.id,
        name: v.name,
        status: 'approved',
      }));

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
}
