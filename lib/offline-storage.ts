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
    });
  }
}

// Connection monitoring
let isOnlineStatus = navigator.onLine;
const connectionListeners: ((online: boolean) => void)[] = [];

export const isOnline = (): boolean => isOnlineStatus;

export const onConnectionChange = (callback: (online: boolean) => void): (() => void) => {
  connectionListeners.push(callback);
  
  const handleOnline = () => {
    isOnlineStatus = true;
    connectionListeners.forEach(cb => cb(true));
  };
  
  const handleOffline = () => {
    isOnlineStatus = false;
    connectionListeners.forEach(cb => cb(false));
  };
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    const index = connectionListeners.indexOf(callback);
    if (index > -1) {
      connectionListeners.splice(index, 1);
    }
  };
};

// Manual sync function
export const triggerManualSync = async (): Promise<void> => {
  if (!isOnlineStatus) return;
  
  try {
    const unsyncedPenalties = await offlineStorage.getUnsyncedPenalties();
    
    for (const item of unsyncedPenalties) {
      try {
        // Try to sync penalty to server
        const response = await fetch('/api/sync-penalty', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.penalty)
        });
        
        if (response.ok) {
          await offlineStorage.markAsSynced(item.id);
        }
      } catch (error) {
        console.error('Failed to sync penalty:', error);
        // Continue with other penalties
      }
    }
  } catch (error) {
    console.error('Manual sync failed:', error);
  }
};

// Create singleton instance
export const offlineStorage = new OfflineStorageService();

// Initialize on import
offlineStorage.init().catch(console.error);
