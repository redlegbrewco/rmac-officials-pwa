import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, off } from 'firebase/database';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export class FirebaseRealtimeService {
  private listeners: (() => void)[] = [];

  subscribeToGameChat(gameId: string, onMessage: (message: ChatMessage) => void) {
    const messagesRef = ref(database, `games/${gameId}/messages`);
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const messages = snapshot.val();
      if (messages) {
        Object.values(messages).forEach((message: any) => {
          onMessage(message);
        });
      }
    });

    this.listeners.push(() => off(messagesRef, 'value', unsubscribe));
    return unsubscribe;
  }

  sendMessage(gameId: string, message: ChatMessage) {
    const messagesRef = ref(database, `games/${gameId}/messages`);
    return push(messagesRef, message);
  }

  cleanup() {
    this.listeners.forEach(cleanup => cleanup());
    this.listeners = [];
  }
}
