export type ChatClient = {
  id: string;
  name: string;
};

export type ChatMessage = {
  id: string;
  name: string;
  content: string;
};

export type ChatLobby = {
  clients: ChatClient[];
  messages: ChatMessage[];
};

export type ChatEvent =
  | { type: 'message'; room: string; payload: ChatMessage }
  | { type: 'join'; room: string; payload: ChatClient }
  | { type: 'leave'; room: string; payload: ChatClient };
