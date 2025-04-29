// src/chat/chat.service.ts
import { Injectable } from '@nestjs/common';

export interface ChatMessage {
  from: string;
  to: string;
  content: string;
  timestamp: Date;
}

@Injectable()
export class ChatService {
  private rooms = new Map<string, ChatMessage[]>();

  private getRoomId(userA: string, userB: string): string {
    const [a, b] = [userA, userB].sort();
    return `${a}:${b}`;
  }

  saveMessage(from: string, to: string, content: string): ChatMessage {
    const timestamp = new Date();
    const msg: ChatMessage = { from, to, content, timestamp };
    const roomId = this.getRoomId(from, to);
    const arr = this.rooms.get(roomId) ?? [];
    arr.push(msg);
    this.rooms.set(roomId, arr);
    return msg;
  }

  getHistory(userA: string, userB: string): ChatMessage[] {
    const roomId = this.getRoomId(userA, userB);
    return this.rooms.get(roomId) ?? [];
  }
}
