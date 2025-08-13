interface BackupStatus {
  isBackingUp: boolean;
  lastBackupTime: string | null;
  backupCount: number;
  error: string | null;
}

class GoogleDriveBackup {
  private backupStatus: BackupStatus = {
    isBackingUp: false,
    lastBackupTime: null,
    backupCount: 0,
    error: null
  };

  async backupGameData(gameData: any, crewName: string): Promise<{ success: boolean; fileId?: string; error?: string }> {
    if (this.backupStatus.isBackingUp) {
      return { success: false, error: 'Backup already in progress' };
    }

    this.backupStatus.isBackingUp = true;
    this.backupStatus.error = null;

    try {
      const fileName = this.generateFileName(gameData.homeTeam, gameData.awayTeam, gameData.date);
      const folderName = `RMAC_${crewName.replace(/\s+/g, '_')}`;
      
      const response = await fetch('/api/backup-to-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          folderName,
          gameData,
          metadata: {
            crew: crewName,
            backupTime: new Date().toISOString(),
            version: '1.0'
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        this.backupStatus.lastBackupTime = new Date().toISOString();
        this.backupStatus.backupCount += 1;
        localStorage.setItem('last_drive_backup', this.backupStatus.lastBackupTime);
        localStorage.setItem('backup_count', this.backupStatus.backupCount.toString());
        
        return { success: true, fileId: result.fileId };
      } else {
        this.backupStatus.error = result.error;
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown backup error';
      this.backupStatus.error = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      this.backupStatus.isBackingUp = false;
    }
  }

  private generateFileName(homeTeam: string, awayTeam: string, date: string): string {
    const gameDate = new Date(date).toISOString().split('T')[0];
    const sanitizedHome = homeTeam.replace(/\s+/g, '_');
    const sanitizedAway = awayTeam.replace(/\s+/g, '_');
    return `RMAC_Game_${gameDate}_${sanitizedHome}_vs_${sanitizedAway}_backup.json`;
  }

  getBackupStatus(): BackupStatus {
    // Load from localStorage on first call
    if (!this.backupStatus.lastBackupTime) {
      this.backupStatus.lastBackupTime = localStorage.getItem('last_drive_backup');
      this.backupStatus.backupCount = parseInt(localStorage.getItem('backup_count') || '0');
    }
    return { ...this.backupStatus };
  }

  async triggerManualBackup(gameData: any, crewName: string): Promise<boolean> {
    const result = await this.backupGameData(gameData, crewName);
    return result.success;
  }
}

export const driveBackup = new GoogleDriveBackup();
