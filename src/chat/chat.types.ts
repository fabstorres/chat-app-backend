export interface ChatClient {
  id: string;
  name: string;
}

export interface ChatMessage {
  id: string;
  name: string;
  content: string;
}

export interface ChatLobby {
  clients: ChatClient[];
  messages: ChatMessage[];
}

export interface ChatEvent {
  type: string;
  room: string;
  payload: {
    id: string;
    name: string;
    content: string;
  };
}
