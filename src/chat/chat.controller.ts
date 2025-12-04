import { Body, Controller, Get, Param, Post, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChatService } from './chat.service';
import { ChatEvent } from './chat.types';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  fetchLobbies() {
    return this.chatService.listLobbies();
  }

  @Post()
  createLobby() {
    return { roomCode: this.chatService.createLobby() };
  }

  @Post('leave')
  leave(@Body('userId') userId: string, @Body('room') room: string) {
    return this.chatService.leaveLobby(userId, room);
  }

  @Post(':room/message')
  sendMessage(
    @Param('room') room: string,
    @Body('userId') userId: string,
    @Body('message') message: string,
  ) {
    console.log('[controller] POST message', { room, userId, message });
    return this.chatService.sendMessage(room, userId, message);
  }

  @Sse(':room')
  connect(@Param('room') room: string): Observable<MessageEvent> {
    console.log('[controller] SSE connect room', JSON.stringify(room));

    // You can return the ChatEvent directly, but to mimic
    // your existing frontend unwrapping logic we wrap once.
    return this.chatService.registerConnection(room).pipe(
      map((event: ChatEvent) => {
        // Nest expects { data: any, event?: string, id?: string, retry?: number }
        // Here we use event.type as SSE event name and the ChatEvent as data.
        return {
          type: event.type,
          data: event,
        } as any;
      }),
    );
  }

  @Get('ping')
  pong() {
    return 'pong';
  }

  @Get('users')
  fetchUsers() {
    return this.chatService.getUsers();
  }

  @Post('user')
  createUser(@Body('name') name: string) {
    const uuid = this.chatService.createUser(name);
    return { uuid };
  }
}
