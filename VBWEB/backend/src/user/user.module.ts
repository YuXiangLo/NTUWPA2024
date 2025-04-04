// src/user/user.module.ts
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../auth/jwt.strategy';

@Module({
  imports: [
    SupabaseModule,
    JwtModule,
  ],
  
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
})
export class UserModule {}
