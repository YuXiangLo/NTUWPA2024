// src/maintainer-applications/admin-review.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { SupabaseClient } from '@supabase/supabase-js';

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

  async updateStatus(id: string, status: 'approved' | 'rejected', reviewerId: string) {
    const { data: existing, error: findErr } = await this.client
      .from('maintainer_applications')
      .select('id')
      .eq('id', id)
      .single();
    if (findErr || !existing) throw new NotFoundException('Application not found');

    const { data, error } = await this.client
      .from('maintainer_applications')
      .update({
        status,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id, status, reviewed_at');
    if (error) throw new InternalServerErrorException(error.message);
    return data[0];
  }
}