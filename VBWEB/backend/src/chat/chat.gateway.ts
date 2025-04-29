// src/chat/chat.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { UnauthorizedException } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) {}

  handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    try {
      const payload = this.jwtService.verify(token);
      client.data.userId = payload.userID;
      console.log(`✅ Client connected: socketId=${client.id} userID=${payload.userID}`);
    } catch (err) {
      console.error('❌ handleConnection failed – invalid token', err);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`🔌 Client disconnected: socketId=${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() { otherUserId }: { otherUserId: string },
  ) {
    const me = client.data.userId;
    const roomId = [me, otherUserId].sort().join(':');
    client.join(roomId);
    console.log(`🚪 User ${me} joined room ${roomId}`);
    return { status: 'joined', roomId };
  }

  @SubscribeMessage('privateMessage')
  handlePrivateMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() { to, content }: { to: string; content: string },
  ) {
    const from: string = client.data.userId;
    const roomId = [from, to].sort().join(':');
    console.log(`✉️  Received from ${from} to ${to}: "${content}"`);

    const msg = this.chatService.saveMessage(from, to, content);

    console.log(`🚀 Emitting message to room ${roomId}`, msg);
    this.server.to(roomId).emit('privateMessage', msg);
    return msg;
  }
}
