// Simple backup service - starts with localStorage, can be enhanced later

interface BackupStatus {
  lastBackupTime: string | null;
  backupCount: number;
  isAuthenticated: boolean;
}

interface BackupResult {
  success: boolean;
  error?: string;
  fileId?: string;
  fileName?: string;
}

class GoogleDriveBackupService {
  private readonly BACKUP_PREFIX = 'rmac_backup_';
  private readonly STATUS_KEY = 'rmac_backup_status';
  private isBackingUp = false;

  private getStatus(): BackupStatus {
    try {
      const saved = localStorage.getItem(this.STATUS_KEY);
      return saved ? JSON.parse(saved) : {
        lastBackupTime: null,
        backupCount: 0,
        isAuthenticated: false
      };
    } catch (error) {
      return {
        lastBackupTime: null,
        backupCount: 0,
        isAuthenticated: false
      };
    }
  }

  private saveStatus(status: BackupStatus): void {
    localStorage.setItem(this.STATUS_KEY, JSON.stringify(status));
  }

  private updateBackupStatus(): void {
    const status = this.getStatus();
    status.lastBackupTime = new Date().toISOString();
    status.backupCount += 1;
    status.isAuthenticated = true;
    this.saveStatus(status);
  }

  async backupGameData(gameData: any, crewName: string): Promise<BackupResult> {
    // Prevent concurrent backups
    if (this.isBackingUp) {
      return {
        success: false,
        error: 'Backup already in progress'
      };
    }

    this.isBackingUp = true;

    try {
      // Format filename
      const date = new Date().toISOString().split('T')[0];
      const fileName = `RMAC_Game_${date}_${gameData.gameInfo.homeTeam}_vs_${gameData.gameInfo.awayTeam}_backup.json`;
      
      // Clean crew name for folder
      const folderName = crewName.replace(/[^a-zA-Z0-9]/g, '_');

      // Call the App Router API endpoint (not pages/api)
      const response = await fetch('/api/backup-to-drive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName,
          folderName: `RMAC_${folderName}`,
          gameData,
          metadata: {
            crew: crewName,
            backupTime: new Date().toISOString(),
            version: '1.0',
            appVersion: 'RMAC Officials PWA v1.0'
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Backup failed: ${response.statusText} - ${errorData.error || 'Unknown error'}`);
      }

      const result = await response.json();

      // Update local status
      this.updateBackupStatus();

      return {
        success: true,
        fileId: result.fileId,
        fileName: result.fileName || fileName
      };

    } catch (error) {
      console.error('Backup error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown backup error'
      };
    } finally {
      this.isBackingUp = false;
    }
  }

  getBackupStatus(): BackupStatus {
    return this.getStatus();
  }

  // New method to check if Google Drive is properly configured
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/backup-to-drive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: 'test_connection.json',
          folderName: 'RMAC_Test',
          gameData: { test: true },
          metadata: { test: true }
        })
      });

      if (response.ok) {
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error || 'Connection test failed' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed' 
      };
    }
  }

  async restoreFromBackup(backupKey: string): Promise<any> {
    try {
      const backupData = localStorage.getItem(backupKey);
      if (!backupData) {
        throw new Error('Backup not found');
      }
      
      const backup = JSON.parse(backupData);
      return backup.data;
    } catch (error) {
      console.error('Failed to restore backup:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const driveBackup = new GoogleDriveBackupService();
    } catch (error) {
      console.error('Download backup failed:', error);
      throw error;
    }
  }

  // Get backup folder URL - now returns actual Drive folder
  getBackupFolderUrl(crewName: string): string {
    const folderName = crewName.replace(/[^a-zA-Z0-9]/g, '_');
    // This could be enhanced to store the actual folder ID from the API response
    return `https://drive.google.com/drive/search?q=RMAC_${folderName}`;
  }

  // New method to check if Google Drive is properly configured
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/backup-to-drive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: 'test_connection.json',
          folderName: 'RMAC_Test',
          gameData: { test: true },
          metadata: { test: true }
        })
      });

      if (response.ok) {
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error || 'Connection test failed' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed' 
      };
    }
  }

  async restoreFromBackup(backupKey: string): Promise<any> {
    try {
      const backupData = localStorage.getItem(backupKey);
      if (!backupData) {
        throw new Error('Backup not found');
      }
      
      const backup = JSON.parse(backupData);
      return backup.data;
    } catch (error) {
      console.error('Failed to restore backup:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const driveBackup = new GoogleDriveBackupService();
