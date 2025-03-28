// src/supabase/supabase.module.ts
import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],  // Make sure SupabaseService is exported
})
export class SupabaseModule {}
