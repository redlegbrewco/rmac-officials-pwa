interface QueuedItem {
  id: string;
  type: 'penalty' | 'sync';
  data: any;
  timestamp: string;
  retryCount: number;
}

class OfflineStorage {
  private readonly QUEUE_PREFIX = 'rmac_queue_';
  private readonly CONNECTION_KEY = 'rmac_is_online';
  private connectionListeners: ((online: boolean) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.updateConnectionStatus(true));
      window.addEventListener('offline', () => this.updateConnectionStatus(false));
    }
  }

  private updateConnectionStatus(online: boolean) {
    localStorage.setItem(this.CONNECTION_KEY, online.toString());
    this.connectionListeners.forEach(listener => listener(online));
  }

  async queuePenalty(penalty: any): Promise<void> {
    const queueItem: QueuedItem = {
      id: `${this.QUEUE_PREFIX}${Date.now()}_${Math.random()}`,
      type: 'penalty',
      data: penalty,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };
    
    localStorage.setItem(queueItem.id, JSON.stringify(queueItem));
  }

  async getQueueCount(): Promise<number> {
    if (typeof window === 'undefined') return 0;
    
    const keys = Object.keys(localStorage);
    return keys.filter(key => key.startsWith(this.QUEUE_PREFIX)).length;
  }

  async getQueuedItems(): Promise<QueuedItem[]> {
    if (typeof window === 'undefined') return [];
    
    const items: QueuedItem[] = [];
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(this.QUEUE_PREFIX)) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '');
          items.push(item);
        } catch (e) {
          console.error('Failed to parse queued item:', e);
        }
      }
    });
    
    return items.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  async removeFromQueue(id: string): Promise<void> {
    localStorage.removeItem(id);
  }

  async clearQueue(): Promise<void> {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.QUEUE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  async processQueue(syncFunction: (item: any) => Promise<boolean>): Promise<{
    successful: number;
    failed: number;
  }> {
    const items = await this.getQueuedItems();
    let successful = 0;
    let failed = 0;

    for (const item of items) {
      try {
        const success = await syncFunction(item.data);
        if (success) {
          await this.removeFromQueue(item.id);
          successful++;
        } else {
          failed++;
          item.retryCount++;
          localStorage.setItem(item.id, JSON.stringify(item));
        }
      } catch (error) {
        console.error('Failed to process queue item:', error);
        failed++;
      }
    }

    return { successful, failed };
  }

  onConnectionChange(callback: (online: boolean) => void): () => void {
    this.connectionListeners.push(callback);
    
    return () => {
      const index = this.connectionListeners.indexOf(callback);
      if (index > -1) {
        this.connectionListeners.splice(index, 1);
      }
    };
  }
}

// Create singleton instance
export const offlineStorage = new OfflineStorage();

// Helper functions
export const isOnline = (): boolean => {
  if (typeof window === 'undefined') return true;
  return window.navigator.onLine;
};

export const onConnectionChange = (callback: (online: boolean) => void) => {
  return offlineStorage.onConnectionChange(callback);
};

export const triggerManualSync = async () => {
  console.log('Manual sync triggered');
  const count = await offlineStorage.getQueueCount();
  console.log(`${count} items in queue`);
};
