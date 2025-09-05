import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(false);
SQLite.enablePromise(true);

export class DatabaseService {
  private static db: SQLite.SQLiteDatabase | null = null;
  
  static async initialize() {
    try {
      this.db = await SQLite.openDatabase({
        name: 'fishing_tracker.db',
        location: 'default',
      });
      
      await this.createTables();
    } catch (error) {
      console.error('Database initialization failed:', error);
    }
  }
  
  private static async createTables() {
    if (!this.db) return;
    
    const queries = [
      `CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        started_at INTEGER NOT NULL,
        ended_at INTEGER,
        title TEXT,
        notes TEXT,
        last_modified_at INTEGER,
        is_synced INTEGER DEFAULT 0,
        is_deleted INTEGER DEFAULT 0
      )`,
      
      `CREATE TABLE IF NOT EXISTS track_points (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        ts INTEGER NOT NULL,
        lat REAL NOT NULL,
        lon REAL NOT NULL,
        acc REAL,
        speed REAL,
        heading REAL,
        last_modified_at INTEGER,
        is_synced INTEGER DEFAULT 0,
        is_deleted INTEGER DEFAULT 0,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS photos (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        ts INTEGER NOT NULL,
        lat REAL,
        lon REAL,
        uri TEXT,
        s3_key TEXT,
        size INTEGER,
        last_modified_at INTEGER,
        is_synced INTEGER DEFAULT 0,
        is_deleted INTEGER DEFAULT 0,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS catches (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        ts INTEGER NOT NULL,
        species TEXT NOT NULL,
        length REAL,
        weight REAL,
        notes TEXT,
        lat REAL,
        lon REAL,
        last_modified_at INTEGER,
        is_synced INTEGER DEFAULT 0,
        is_deleted INTEGER DEFAULT 0,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        retry_count INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL
      )`,
    ];
    
    for (const query of queries) {
      await this.db.executeSql(query);
    }
  }
  
  static getDatabase(): SQLite.SQLiteDatabase | null {
    return this.db;
  }
  
  // Session operations
  static async createSession(session: any) {
    if (!this.db) throw new Error('Database not initialized');
    
    const query = `INSERT INTO sessions (id, started_at, ended_at, title, notes, last_modified_at) 
                   VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [
      session.id,
      session.started_at,
      session.ended_at,
      session.title,
      session.notes,
      Date.now(),
    ];
    
    await this.db.executeSql(query, params);
    await this.addToSyncQueue('session', session.id, 'create');
  }
  
  static async updateSession(id: string, updates: any) {
    if (!this.db) throw new Error('Database not initialized');
    
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    
    const query = `UPDATE sessions SET ${setClause}, last_modified_at = ? WHERE id = ?`;
    const params = [...values, Date.now(), id];
    
    await this.db.executeSql(query, params);
    await this.addToSyncQueue('session', id, 'update');
  }
  
  static async getSessions(limit = 50): Promise<any[]> {
    if (!this.db) return [];
    
    const query = `SELECT * FROM sessions WHERE is_deleted = 0 ORDER BY started_at DESC LIMIT ?`;
    const [result] = await this.db.executeSql(query, [limit]);
    
    const sessions = [];
    for (let i = 0; i < result.rows.length; i++) {
      sessions.push(result.rows.item(i));
    }
    return sessions;
  }
  
  // Track point operations
  static async addTrackPoint(point: any) {
    if (!this.db) throw new Error('Database not initialized');
    
    const query = `INSERT INTO track_points (id, session_id, ts, lat, lon, acc, speed, heading, last_modified_at) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      point.id,
      point.session_id,
      point.ts,
      point.lat,
      point.lon,
      point.acc,
      point.speed,
      point.heading,
      Date.now(),
    ];
    
    await this.db.executeSql(query, params);
    await this.addToSyncQueue('track_point', point.id, 'create');
  }
  
  static async getTrackPoints(sessionId: string): Promise<any[]> {
    if (!this.db) return [];
    
    const query = `SELECT * FROM track_points WHERE session_id = ? AND is_deleted = 0 ORDER BY ts ASC`;
    const [result] = await this.db.executeSql(query, [sessionId]);
    
    const points = [];
    for (let i = 0; i < result.rows.length; i++) {
      points.push(result.rows.item(i));
    }
    return points;
  }
  
  // Catch operations
  static async addCatch(catchData: any) {
    if (!this.db) throw new Error('Database not initialized');
    
    const query = `INSERT INTO catches (id, session_id, ts, species, length, weight, notes, lat, lon, last_modified_at) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      catchData.id,
      catchData.session_id,
      catchData.ts,
      catchData.species,
      catchData.length,
      catchData.weight,
      catchData.notes,
      catchData.lat,
      catchData.lon,
      Date.now(),
    ];
    
    await this.db.executeSql(query, params);
    await this.addToSyncQueue('catch', catchData.id, 'create');
  }
  
  static async getCatches(sessionId: string): Promise<any[]> {
    if (!this.db) return [];
    
    const query = `SELECT * FROM catches WHERE session_id = ? AND is_deleted = 0 ORDER BY ts DESC`;
    const [result] = await this.db.executeSql(query, [sessionId]);
    
    const catches = [];
    for (let i = 0; i < result.rows.length; i++) {
      catches.push(result.rows.item(i));
    }
    return catches;
  }
  
  // Sync queue operations
  static async addToSyncQueue(entityType: string, entityId: string, operation: string) {
    if (!this.db) return;
    
    const query = `INSERT INTO sync_queue (entity_type, entity_id, operation, created_at) VALUES (?, ?, ?, ?)`;
    const params = [entityType, entityId, operation, Date.now()];
    
    await this.db.executeSql(query, params);
  }
  
  static async getSyncQueue(): Promise<any[]> {
    if (!this.db) return [];
    
    const query = `SELECT * FROM sync_queue ORDER BY created_at ASC LIMIT 100`;
    const [result] = await this.db.executeSql(query);
    
    const items = [];
    for (let i = 0; i < result.rows.length; i++) {
      items.push(result.rows.item(i));
    }
    return items;
  }
  
  static async removeSyncQueueItem(id: number) {
    if (!this.db) return;
    
    const query = `DELETE FROM sync_queue WHERE id = ?`;
    await this.db.executeSql(query, [id]);
  }
}