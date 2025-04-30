import { Module } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { SupabaseService } from '../supabase/supabase.service';

@Module({
  providers: [FriendsService, SupabaseService],
  controllers: [FriendsController],
})
export class FriendsModule {}
