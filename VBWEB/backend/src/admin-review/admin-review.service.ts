// src/maintainer-applications/admin-review.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { SupabaseClient } from '@supabase/supabase-js';

interface LocationInput {
  longitude: number;
  latitude: number;
}

@Injectable()
export class AdminReviewService {
  private readonly client: SupabaseClient;

  constructor(private readonly supabase: SupabaseService) {
    this.client = this.supabase.client;
  }

  async listPending() {
    const { data, error } = await this.client
      .from('maintainer_applications')
      .select('*')
      .eq('status', 'pending');
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async updateStatus(
    id: string,
    status: 'approved' | 'rejected',
    reviewerId: string,
    location?: LocationInput,
  ) {
    // 1) fetch application record
    const { data: app, error: findErr } = await this.client
      .from('maintainer_applications')
      .select('*')
      .eq('id', id)
      .single();
    if (findErr || !app) throw new NotFoundException('Application not found');

    // 2) update application status only
    const { data: updatedApp, error: updateErr } = await this.client
      .from('maintainer_applications')
      .update({
        status,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();
    if (updateErr) throw new InternalServerErrorException(updateErr.message);

    // 3) if approved, insert into venues table
    if (status === 'approved') {
      const venuePayload: any = {
        application_id: id,
        maintainer_id: app.user_id,
        name: app.venue_name,
        address: app.address,
        phone: app.phone,
        detail: app.detail,
        location: location
          ? [location.longitude, location.latitude]
          : null,
      };
      const { error: venueErr } = await this.client
        .from('venues')
        .insert([venuePayload]);
      if (venueErr) throw new InternalServerErrorException(venueErr.message);
    }

    return updatedApp;
  }
}
