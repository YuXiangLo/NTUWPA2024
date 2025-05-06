// src/maintainer-applications/maintainer-applications.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { Express } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateMaintainerApplicationDto } from './dto/create-maintainer-application.dto';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class MaintainerApplicationsService {
  private readonly client: SupabaseClient;
  private readonly bucket = 'maintainer.applications';

  constructor(private readonly supabase: SupabaseService) {
    this.client = this.supabase.client;
  }

  async create(
    dto: CreateMaintainerApplicationDto,
    userId: string,
    files: { image1?: Express.Multer.File[]; image2?: Express.Multer.File[] } = {},
  ) {
    try {
      // Ensure files is an object
      files = files || {};

      // 1) Handle file uploads
      const uploads: Record<'image1' | 'image2', string | null> = {
        image1: null,
        image2: null,
      };

      for (const key of ['image1', 'image2'] as const) {
        const file = files[key]?.[0];
        if (!file) continue;

        const ext = file.originalname.split('.').pop();
        const filename = `${uuidv4()}.${ext}`;
        const { error: uploadErr } = await this.client.storage
          .from(this.bucket)
          .upload(`${userId}/${filename}`, file.buffer, {
            contentType: file.mimetype,
          });
        if (uploadErr) throw uploadErr;

        const { data } = this.client.storage
          .from(this.bucket)
          .getPublicUrl(`${userId}/${filename}`);
        uploads[key] = data.publicUrl;
      }

      // 2) Map camelCase DTO → snake_case DB columns
      const payload = {
        user_id:    userId,
        venue_name: dto.venueName,
        address:    dto.address,
        phone:      dto.phone || null,
        detail:     dto.detail || null,
        image1:     uploads.image1,
        image2:     uploads.image2,
      };

      // 3) Insert into Supabase
      const { data, error } = await this.client
        .from('maintainer_applications')
        .insert([payload])
        .select('id, status, submitted_at')
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
