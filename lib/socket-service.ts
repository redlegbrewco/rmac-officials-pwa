import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect(gameId: string, officialId: string) {
    this.socket = io('http://localhost:3001', {
      query: { gameId, officialId }
    });

    this.socket.on('connect', () => {
      console.log('Connected to game room');
    });

    this.socket.on('crew-message', (message: ChatMessage) => {
      window.dispatchEvent(new CustomEvent('crew-message', { detail: message }));
    });

    this.socket.on('penalty-alert', (penalty: any) => {
      window.dispatchEvent(new CustomEvent('penalty-alert', { detail: penalty }));
    });

    this.socket.emit('join-game', { gameId, officialId });
  }

  sendMessage(gameId: string, message: ChatMessage) {
    this.socket?.emit('crew-message', { gameId, message });
  }

  broadcastPenalty(gameId: string, penalty: any) {
    this.socket?.emit('penalty-alert', { gameId, penalty });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const socketService = new SocketService();
