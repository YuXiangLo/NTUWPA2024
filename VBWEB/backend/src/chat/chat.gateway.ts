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

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    try {
      const payload = this.jwtService.verify(token);
      client.data.userId = payload.userID;
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {}

  /** Join either private or group using chatId */
  @SubscribeMessage('joinChat')
  async onJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() { chatId }: { chatId: string },
  ) {
    await this.chatService.assertMember(chatId, client.data.userId);
    client.join(chatId);
    return { status: 'joined', chatId };
  }

  /** Send message into chatId */
  @SubscribeMessage('sendMessage')
  async onMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatId: string; content: string },
  ) {
    const msg = await this.chatService.sendMessage(
      payload.chatId,
      client.data.userId,
      payload.content
    );
    this.server.to(payload.chatId).emit('newMessage', msg);
    return msg;
  }
}
