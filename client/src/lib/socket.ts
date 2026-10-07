import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return socket;
}

export function joinRoom(room: string) {
  const s = getSocket();
  s.emit('join-room', room);
}

export function leaveRoom(room: string) {
  const s = getSocket();
  s.emit('leave-room', room);
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
