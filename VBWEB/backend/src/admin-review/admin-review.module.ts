// src/maintainer-applications/admin-review.module.ts
import { Module } from '@nestjs/common';
import { AdminReviewService } from './admin-review.service';
import { AdminReviewController } from './admin-review.controller';
import { SupabaseService } from '../supabase/supabase.service';

@Module({
  providers: [SupabaseService, AdminReviewService],
  controllers: [AdminReviewController],
})
export class AdminReviewModule {}
