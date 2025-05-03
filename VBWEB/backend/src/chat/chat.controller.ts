// src/chat/chat.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService, ChatListItem, Chat, Message } from './chat.service';
import { Request } from 'express';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatSvc: ChatService) {}

  /** GET /chats — returns list with unreadCount & lastMessageAt */
  @Get()
  async listChats(@Req() req: Request): Promise<ChatListItem[]> {
    const userId = (req.user as any).userid;
    return this.chatSvc.listChats(userId);
  }

  /** POST /chats/:chatId/read — mark that chat read for current user */
  @Post(':chatId/read')
  async markRead(
    @Req() req: Request,
    @Param('chatId') chatId: string
  ): Promise<void> {
    const userId = (req.user as any).userid;
    await this.chatSvc.markChatRead(chatId, userId);
  }

  /** GET existing private chat or 404 */
  @Get('private/:friendId')
  async getPrivate(
    @Req() req: Request,
    @Param('friendId') friendId: string
  ): Promise<Chat> {
    const userId = (req.user as any).userid;
    const chat = await this.chatSvc.getOrCreatePrivateChat(userId, friendId);
    // `get_or_create` always returns something; to treat GET as only-read:
    // you could check if it existed by returning 404 if user1/user2 match but no created_at?
    // For simplicity we always return the chat record.
    return chat;
  }

  /** POST create-or-return private chat */
  @Post('private/:friendId')
  async postPrivate(
    @Req() req: Request,
    @Param('friendId') friendId: string
  ): Promise<Chat> {
    const userId = (req.user as any).userid;
    return this.chatSvc.getOrCreatePrivateChat(userId, friendId);
  }

  /** Create a new group chat */
  @Post('group')
  async createGroup(
    @Req() req: Request,
    @Body() body: { name: string; members: string[] }
  ): Promise<Chat> {
    const userId = (req.user as any).userid;
    return this.chatSvc.createGroupChat(userId, body.name, body.members);
  }

  /** Add a member to a group */
  @Post(':chatId/members/:userId')
  async addMember(
    @Param('chatId') chatId: string,
    @Param('userId') userId: string
  ) {
    await this.chatSvc.addMember(chatId, userId);
  }

  /** Remove a member from a group */
  @Post(':chatId/remove/:userId')
  async removeMember(
    @Param('chatId') chatId: string,
    @Param('userId') userId: string
  ) {
    await this.chatSvc.removeMember(chatId, userId);
  }

  @Get(':chatId/messages')
  async getMessages(
    @Req() req: Request,
    @Param('chatId') chatId: string
  ): Promise<Message[]> {
    const userId = (req.user as any).userid;
    return this.chatSvc.getMessages(chatId, userId);
  }

  /** Send a message */
  @Post(':chatId/messages')
  async sendMsg(
    @Req() req: Request,
    @Param('chatId') chatId: string,
    @Body() body: { content: string }
  ): Promise<Message> {
    const userId = (req.user as any).userid;
    return this.chatSvc.sendMessage(chatId, userId, body.content);
  }
}
