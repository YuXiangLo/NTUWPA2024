// src/app.module.ts
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { VenueModule } from './venue/venue.module';
import { CourtModule } from './court/court.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule,
    AuthModule,
    UserModule,
    VenueModule,
    CourtModule,
  ]
})
export class AppModule {}
