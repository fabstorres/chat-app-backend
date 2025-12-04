import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ChatClient, ChatEvent, ChatLobby, ChatMessage } from './chat.types';

@Injectable()
export class ChatService {
  private lobbies: Map<string, ChatLobby> = new Map();
  private users: Map<string, ChatClient> = new Map();

  // room -> set of "send" functions
  private streams: Map<string, Set<(data: ChatEvent) => void>> = new Map();

  // ---------- Users ----------

  createUser(displayName: string) {
    const uuid = crypto.randomUUID();
    const user: ChatClient = { id: uuid, name: displayName };
    this.users.set(uuid, user);
    return uuid;
  }

  getUser(id: string) {
    return this.users.get(id);
  }

  getUsers() {
    return Array.from(this.users, ([k, v]) => ({
      id: k,
      name: v.name,
    }));
  }

  // ---------- Lobbies ----------

  createLobby() {
    const lobby: ChatLobby = { clients: [], messages: [] };
    const room = crypto.randomUUID().slice(0, 4);
    this.lobbies.set(room, lobby);
    return room;
  }

  joinLobby(userId: string, roomCode: string) {
    if (!this.users.get(userId)) {
      return { ok: false, err: '[Error] User does not exist.' };
    }
    if (!this.lobbies.has(roomCode)) {
      return { ok: false, err: '[Error] Lobby does not exist.' };
    }
    const room = this.lobbies.get(roomCode)!;
    const user = this.users.get(userId)!;

    if (room.clients.some((client) => client.id === userId)) {
      return {
        ok: false,
        err: '[Error] Client is already connected to the lobby.',
      };
    }
    room.clients.push(user);
    return { ok: true, err: null };
  }

  listLobbies() {
    return Array.from(this.lobbies, ([k, v]) => ({
      room: k,
      clients: v.clients.length,
    }));
  }

  leaveLobby(userId: string, roomCode: string) {
    const room = this.lobbies.get(roomCode);
    if (!room) return { ok: false, err: 'Lobby does not exist' };

    room.clients = room.clients.filter((c) => c.id !== userId);
    return { ok: true, err: null };
  }

  // ---------- SSE / Streaming ----------

  // Called when a client connects to /chat/:room via SSE
  registerConnection(room: string): Observable<ChatEvent> {
    if (!this.streams.has(room)) {
      this.streams.set(room, new Set());
    }

    console.log('[backend] registerConnection for room', JSON.stringify(room));

    return new Observable<ChatEvent>((observer) => {
      console.log('[backend] new SSE observer for room', JSON.stringify(room));

      const send = (data: ChatEvent) => {
        console.log(
          '[backend] sending event to observer for room',
          JSON.stringify(room),
          data,
        );
        observer.next(data);
      };

      const roomSet = this.streams.get(room)!;
      roomSet.add(send);

      // Cleanup when client disconnects
      return () => {
        console.log(
          '[backend] cleanup SSE observer for room',
          JSON.stringify(room),
        );
        roomSet.delete(send);
      };
    });
  }

  private broadcast(room: string, payload: ChatEvent) {
    console.log('[backend] broadcast to room', JSON.stringify(room), payload);
    const roomSet = this.streams.get(room);
    console.log(
      '[backend] roomSet size for',
      JSON.stringify(room),
      roomSet ? roomSet.size : 'none',
    );
    if (!roomSet) return;

    for (const send of roomSet) {
      send(payload);
    }
  }

  // ---------- Messages ----------

  sendMessage(roomCode: string, userId: string, message: string) {
    console.log('[backend] sendMessage', { roomCode, userId, message });

    const room = this.lobbies.get(roomCode);
    if (!room) return { ok: false, err: 'Lobby does not exist' };

    const user = this.users.get(userId);
    if (!user) return { ok: false, err: 'User does not exist' };

    const chatMessage: ChatMessage = {
      id: user.id,
      name: user.name,
      content: message,
    };

    room.messages.push(chatMessage);

    const event: ChatEvent = {
      type: 'message',
      room: roomCode,
      payload: {
        id: user.id,
        name: user.name,
        content: message,
      },
    };

    this.broadcast(roomCode, event);

    return { ok: true };
  }
}
