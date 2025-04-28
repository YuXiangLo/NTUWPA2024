// src/chat/chat.controller.ts
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/request-with-user.interface';
import { Req } from '@nestjs/common';

@ApiTags('chat')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('history/:otherUserId')
  @ApiOperation({ summary: 'Get one-on-one chat history' })
  getHistory(
	@Req() req: RequestWithUser,
    @Param('otherUserId') otherUserId: string,
  ) {
    const me = req.user.userID;
    return this.chatService.getHistory(me, otherUserId);
  }
}
