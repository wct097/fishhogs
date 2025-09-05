import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DatabaseService} from './database';
import {API_BASE_URL} from '../config/api';

export class SyncService {
  private static isSyncing = false;
  
  static async syncData() {
    if (this.isSyncing) return;
    
    try {
      this.isSyncing = true;
      
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        console.log('No auth token, skipping sync');
        return;
      }
      
      // Get last sync timestamp
      const lastSync = await AsyncStorage.getItem('last_sync_timestamp');
      
      // Prepare upload data
      const syncQueue = await DatabaseService.getSyncQueue();
      const uploadData = await this.prepareSyncData(syncQueue);
      
      // Upload data
      if (uploadData.sessions.length > 0 || uploadData.track_points.length > 0 || 
          uploadData.catches.length > 0 || uploadData.photos_meta.length > 0) {
        
        const response = await axios.post(
          `${API_BASE_URL}/sync/up`,
          {
            last_sync_timestamp: lastSync,
            ...uploadData,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (response.data.status === 'success') {
          // Clear processed items from sync queue
          for (const item of syncQueue) {
            await DatabaseService.removeSyncQueueItem(item.id);
          }
          
          // Update last sync timestamp
          await AsyncStorage.setItem('last_sync_timestamp', response.data.server_timestamp);
        }
      }
      
      // Download data
      await this.downloadData(token, lastSync);
      
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }
  
  private static async prepareSyncData(syncQueue: any[]) {
    const data = {
      sessions: [],
      track_points: [],
      catches: [],
      photos_meta: [],
    };
    
    for (const item of syncQueue) {
      const db = DatabaseService.getDatabase();
      if (!db) continue;
      
      switch (item.entity_type) {
        case 'session': {
          const [result] = await db.executeSql(
            'SELECT * FROM sessions WHERE id = ?',
            [item.entity_id]
          );
          if (result.rows.length > 0) {
            const session = result.rows.item(0);
            data.sessions.push({
              id: session.id,
              started_at: new Date(session.started_at).toISOString(),
              ended_at: session.ended_at ? new Date(session.ended_at).toISOString() : null,
              title: session.title,
              notes: session.notes,
            });
          }
          break;
        }
        
        case 'track_point': {
          const [result] = await db.executeSql(
            'SELECT * FROM track_points WHERE id = ?',
            [item.entity_id]
          );
          if (result.rows.length > 0) {
            const point = result.rows.item(0);
            data.track_points.push({
              id: point.id,
              session_id: point.session_id,
              ts: point.ts,
              lat: point.lat,
              lon: point.lon,
              acc: point.acc,
              speed: point.speed,
              heading: point.heading,
            });
          }
          break;
        }
        
        case 'catch': {
          const [result] = await db.executeSql(
            'SELECT * FROM catches WHERE id = ?',
            [item.entity_id]
          );
          if (result.rows.length > 0) {
            const catchItem = result.rows.item(0);
            data.catches.push({
              id: catchItem.id,
              session_id: catchItem.session_id,
              ts: catchItem.ts,
              species: catchItem.species,
              length: catchItem.length,
              weight: catchItem.weight,
              notes: catchItem.notes,
              lat: catchItem.lat,
              lon: catchItem.lon,
            });
          }
          break;
        }
      }
    }
    
    return data;
  }
  
  private static async downloadData(token: string, lastSync: string | null) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/sync/down`,
        {
          last_sync_timestamp: lastSync,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Process downloaded data
      // TODO: Implement conflict resolution and local DB updates
      
      await AsyncStorage.setItem('last_sync_timestamp', response.data.server_timestamp);
    } catch (error) {
      console.error('Download sync failed:', error);
    }
  }
  
  static async triggerSync() {
    // Manual sync trigger
    await this.syncData();
  }
}