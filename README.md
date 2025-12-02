# Simple Nest.js Chat Backend

This is a small project built to learn Nest.js. It provides basic chat functionality like creating users, creating lobbies, joining lobbies, listing lobbies, and sending messages. Everything is stored in memory using Maps, which keeps the code simple and easy to understand.

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

## Routes

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

## Notes

- This project is for learning Nest.js.
- Data is stored in memory and resets on server restart.
