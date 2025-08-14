class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(gameId: string, userId: string) {
    const wsUrl = `ws://localhost:8080/game/${gameId}?userId=${userId}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('Connected to game chat');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      window.dispatchEvent(new CustomEvent('crew-message', { detail: data }));
    };

    this.ws.onclose = () => {
      this.reconnect(gameId, userId);
    };
  }

  sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private reconnect(gameId: string, userId: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect(gameId, userId);
      }, 1000 * this.reconnectAttempts);
    }
  }
}

export const websocketService = new WebSocketService();
