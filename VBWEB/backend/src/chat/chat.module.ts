// src/chat/chat.module.ts
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { SupabaseService } from '../supabase/supabase.service';
import { AuthModule } from '../auth/auth.module';  // <-- 引入

@Module({
  imports: [
    AuthModule,           // 确保 JwtModule/ JwtService 被提供
  ],
  providers: [
    ChatService,
    ChatGateway,
    SupabaseService,
  ],
  controllers: [
    ChatController,
  ],
})
export class ChatModule {}
