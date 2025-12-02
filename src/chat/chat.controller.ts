import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  fetchLobbies() {
    return this.chatService.listLobbies();
  }
  @Post()
  createLobby() {
    return this.chatService.createLobby();
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
    return this.chatService.sendMessage(room, userId, message);
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
    return uuid;
  }
}
