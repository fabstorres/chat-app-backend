export type ChatClient = {
  id: string;
  name: string;
  res?: Response;
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
