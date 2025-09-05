import {create} from 'zustand';
import {DatabaseService} from '../services/database';
import {TrackingService} from '../services/tracking';
import {v4 as uuidv4} from 'uuid';

interface SessionState {
  activeSession: any | null;
  sessions: any[];
  
  startSession: (title?: string) => Promise<void>;
  stopSession: () => Promise<void>;
  loadSessions: () => Promise<void>;
  getSession: (id: string) => Promise<any>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  activeSession: null,
  sessions: [],
  
  startSession: async (title?: string) => {
    const sessionId = uuidv4();
    const now = Date.now();
    
    const session = {
      id: sessionId,
      started_at: now,
      ended_at: null,
      title: title || `Session ${new Date(now).toLocaleDateString()}`,
      notes: null,
    };
    
    await DatabaseService.createSession(session);
    await TrackingService.startTracking(sessionId);
    
    set({activeSession: session});
    await get().loadSessions();
  },
  
  stopSession: async () => {
    const {activeSession} = get();
    if (!activeSession) return;
    
    TrackingService.stopTracking();
    
    const now = Date.now();
    await DatabaseService.updateSession(activeSession.id, {
      ended_at: now,
    });
    
    set({activeSession: null});
    await get().loadSessions();
  },
  
  loadSessions: async () => {
    const sessions = await DatabaseService.getSessions();
    set({sessions});
  },
  
  getSession: async (id: string) => {
    const sessions = await DatabaseService.getSessions();
    return sessions.find(s => s.id === id);
  },
}));