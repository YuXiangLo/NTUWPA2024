// src/chat/chat.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';

export interface Chat {
  id: string;
  type: 'private' | 'group';
  name?: string;
  user1?: string;
  user2?: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}


export interface ChatListItem {
  id: string;
  type: 'private' | 'group';
  name: string | null;
  partnerId: string;
  partnerName: string;
  partnerPhoto: string | null;
  lastMessageAt: string;
  unreadCount: number;
}

@Injectable()
export class ChatService {
  private client: SupabaseClient;

  constructor(private readonly supabase: SupabaseService) {
    this.client = this.supabase.client;
  }

  /** List all chats for the user, with unread counts */
  async listChats(userId: string): Promise<ChatListItem[]> {
    const { data, error } = await this.client
      .rpc<'get_user_chats', unknown>('get_user_chats', { p_user_id: userId });

    if (error) throw error;
    return (data as ChatListItem[]) ?? [];
  }

  /** Mark all messages in a chat as read */
  async markChatRead(chatId: string, userId: string): Promise<void> {
    const { error } = await this.client
      .from('chat_members')
      .update({ last_read_at: new Date().toISOString() })
      .match({ chat_id: chatId, user_id: userId });
    if (error) throw error;
  }

  /**
   * RPC: get or create a unique private chat
   */
  async getOrCreatePrivateChat(userA: string, userB: string): Promise<Chat> {
    const { data, error } = await this.client
      .rpc('get_or_create_private_chat', {
        user_a: userA,
        user_b: userB
      });
    if (error) throw error;
    return data as Chat;
  }

  /**
   * Create a new group chat
   */
  async createGroupChat(userId: string, name: string, members: string[]): Promise<Chat> {
    const { data: chat, error: chatErr } = await this.client
      .from('chats')
      .insert({ type: 'group', name, created_by: userId })
      .select('*')
      .single();
    if (chatErr) throw chatErr;

    // add members
    const rows = members.map(uid => ({ chat_id: chat.id, user_id: uid }));
    rows.push({ chat_id: chat.id, user_id: userId });
    const { error: memErr } = await this.client
      .from('chat_members')
      .insert(rows);
    if (memErr) throw memErr;

    return chat as Chat;
  }

  /**
   * Ensure user is a member of chat
   */
  async assertMember(chatId: string, userId: string): Promise<void> {
    const { data, error } = await this.client
      .from('chat_members')
      .select('*')
      .eq('chat_id', chatId)
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new UnauthorizedException();
  }

  /**
   * Send a message into a chat
   */
  async sendMessage(chatId: string, senderId: string, content: string): Promise<Message> {
    await this.assertMember(chatId, senderId);

    const { data, error } = await this.client
      .from('messages')
      .insert({ chat_id: chatId, sender_id: senderId, content })
      .select('*')
      .single();
    if (error) throw error;
    return data as Message;
  }

  /**
   * Fetch recent messages for a chat
   */
  async getMessages(
    chatId: string,
    userId: string,
    limit = 50
  ): Promise<Message[]> {
    // Now we pass the real userId
    await this.assertMember(chatId, userId);

    const { data, error } = await this.client
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data as Message[];
  }

  /**
   * Add or remove members in a group
   */
  async addMember(chatId: string, userId: string): Promise<void> {
    const { error } = await this.client
      .from('chat_members')
      .insert({ chat_id: chatId, user_id: userId });
    if (error) throw error;
  }

  async removeMember(chatId: string, userId: string): Promise<void> {
    const { error } = await this.client
      .from('chat_members')
      .delete()
      .match({ chat_id: chatId, user_id: userId });
    if (error) throw error;
  }

  
}
