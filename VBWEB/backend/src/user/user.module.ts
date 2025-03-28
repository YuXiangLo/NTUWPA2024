// src/user/user.module.ts
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { JwtModule } from '@nestjs/jwt';  // Import JwtModule here

@Module({
  imports: [
    SupabaseModule,
    JwtModule,  // Make sure JwtModule is imported here
  ],
  
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
