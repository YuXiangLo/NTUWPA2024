// src/maintainer-applications/maintainer-applications.module.ts
import { Module } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { MaintainerApplicationsService } from './maintainer-applications.service';
import { MaintainerApplicationsController } from './maintainer-applications.controller';

@Module({
  imports: [],
  providers: [SupabaseService, MaintainerApplicationsService],
  controllers: [MaintainerApplicationsController],
})
export class MaintainerApplicationsModule {}
