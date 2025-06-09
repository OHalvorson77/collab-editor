// socket.js
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

// Create a Yjs document
export const ydoc = new Y.Doc();

// Connect to your WebSocket server (make sure it's running on that port)
export const provider = new WebsocketProvider('ws://localhost:1234', 'my-room-id', ydoc);

// Sync status monitoring
provider.on('status', event => {
  console.log(`WebSocket status: ${event.status}`); // "connected" or "disconnected"
});
