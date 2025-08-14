import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, off } from 'firebase/database';

// ChatMessage interface for Firebase
interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  urgent: boolean;
  type: 'text' | 'penalty_alert' | 'system' | 'announcement';
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export class FirebaseRealtimeService {
  private listeners: (() => void)[] = [];

  subscribeToGameChat(gameId: string, onMessage: (message: ChatMessage) => void) {
    const messagesRef = ref(database, `games/${gameId}/messages`);
    
    const unsubscribe = onValue(messagesRef, (snapshot: any) => {
      const messages = snapshot.val();
      if (messages) {
        Object.values(messages).forEach((message: any) => {
          onMessage(message as ChatMessage);
        });
      }
    });

    this.listeners.push(() => off(messagesRef, 'value', unsubscribe));
    return unsubscribe;
  }

  async sendMessage(gameId: string, message: Omit<ChatMessage, 'id'>) {
    const messagesRef = ref(database, `games/${gameId}/messages`);
    const messageWithId = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    return push(messagesRef, messageWithId);
  }

  subscribeToGameUpdates(gameId: string, onUpdate: (update: any) => void) {
    const updatesRef = ref(database, `games/${gameId}/updates`);
    
    const unsubscribe = onValue(updatesRef, (snapshot: any) => {
      const updates = snapshot.val();
      if (updates) {
        Object.values(updates).forEach((update: any) => {
          onUpdate(update);
        });
      }
    });

    this.listeners.push(() => off(updatesRef, 'value', unsubscribe));
    return unsubscribe;
  }

  async broadcastPenaltyUpdate(gameId: string, penalty: any) {
    const updatesRef = ref(database, `games/${gameId}/updates`);
    const update = {
      type: 'penalty',
      data: penalty,
      timestamp: new Date().toISOString(),
      id: Date.now().toString()
    };
    
    return push(updatesRef, update);
  }

  cleanup() {
    this.listeners.forEach(cleanup => cleanup());
    this.listeners = [];
  }
}

// Export singleton instance
export const firebaseRealtimeService = new FirebaseRealtimeService();
