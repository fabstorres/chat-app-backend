# Simple Nest.js Chat Backend with SSE

This project was built to learn Nest.js, Angular, and how Server Sent Events (SSE) work.  
It provides simple chat functionality: creating users, creating lobbies, joining lobbies, listing lobbies, sending messages, and subscribing to real time updates.  
All data is stored in memory using Maps for simplicity.

## Requirements

- Node.js 18 or later
- pnpm

## Installation

```bash
pnpm install
```

## Running the server

```bash
pnpm start:dev
```

The server runs at `http://localhost:3000`.

## Architecture Overview

This project follows a clean separation of concerns:

- **REST routes** handle creating users, creating lobbies, joining, leaving, and fetching message history.
- **SSE routes** provide real time updates for each lobby.
- **POST** requests update server state.
- **SSE** streams broadcast new events to connected clients.
- Connections are tracked separately from users so multiple tabs or lobbies can be subscribed at once.

## REST Routes

### GET /chat

List all lobbies.

### GET /chat/ping

Returns `"pong"`.

### GET /chat/users

List all users.

### POST /chat/user

Create a new user.

Body:

```json
{ "name": "Alice" }
```

### POST /chat/:room/message

Send a message to a lobby.

Body:

```json
{ "userId": "user-id-here", "message": "Hello" }
```

### GET /chat/:room/messages

Fetch the message history for a lobby.

## SSE Route

### GET /events/:room

Subscribe to real time events for a lobby.

Clients must pass identity info using query params or headers because SSE does not accept request bodies.

Example:

```
/events/abcd?userId=1234
```

This connection streams **only new events**, such as:

- New messages
- User join events
- User leave events

Each SSE event carries a typed payload that looks like:

```json
{
  "type": "message",
  "payload": {
    "id": "msg-id",
    "name": "Alice",
    "content": "Hello world"
  }
}
```

## Notes

- This project is for learning purposes.
- All data lives in memory and resets on server restart.
- SSE connections are handled using Observables.
- The server cleanly tears down connections when clients disconnect or close their tabs.
