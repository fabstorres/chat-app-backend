import { Injectable } from '@nestjs/common';
import { ChatClient, ChatEvent, ChatLobby, ChatMessage } from './chat.types';
import { Observable } from 'rxjs';

@Injectable()
export class ChatService {
  private lobbies: Map<string, ChatLobby> = new Map();
  private users: Map<string, ChatClient> = new Map();
  private streams: Map<string, Set<(data: ChatEvent) => void>> = new Map();
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

  registerConnection(room: string) {
    if (!this.streams.has(room)) {
      this.streams.set(room, new Set());
    }

    return new Observable<ChatEvent>((observer) => {
      const send = (data: ChatEvent) => observer.next(data);
      const roomSet = this.streams.get(room)!;

      roomSet.add(send);

      const cleanup = () => roomSet.delete(send);
      return cleanup;
    });
  }

  broadcast(room: string, payload: ChatEvent) {
    const roomSet = this.streams.get(room);
    if (!roomSet) return;

    for (const send of roomSet) {
      send(payload);
    }
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

  sendMessage(roomCode: string, userId: string, message: string) {
    const room = this.lobbies.get(roomCode);
    if (!room) return { ok: false, err: 'Lobby does not exist' };

    const user = this.users.get(userId);
    if (!user) return { ok: false, err: 'User does not exist' };

    room.messages.push({
      id: user.id,
      name: user.name,
      content: message,
    });

    this.broadcast(roomCode, {
      type: 'message',
      room: roomCode,
      payload: { id: userId, name: user.name, content: message },
    });

    return { ok: true };
  }
}
