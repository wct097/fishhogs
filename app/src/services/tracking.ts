import Geolocation from 'react-native-geolocation-service';
import {Platform, PermissionsAndroid} from 'react-native';
import {DatabaseService} from './database';
import {v4 as uuidv4} from 'uuid';

export class TrackingService {
  private static intervalId: NodeJS.Timeout | null = null;
  private static currentSessionId: string | null = null;
  private static lastTrackTime = 0;
  private static readonly TRACK_INTERVAL = 5 * 60 * 1000; // 5 minutes
  
  static async startTracking(sessionId: string) {
    this.currentSessionId = sessionId;
    this.lastTrackTime = 0;
    
    // Get initial location
    await this.recordLocation();
    
    // Set up interval for tracking
    this.intervalId = setInterval(async () => {
      await this.recordLocation();
    }, this.TRACK_INTERVAL);
  }
  
  static stopTracking() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.currentSessionId = null;
  }
  
  private static async recordLocation() {
    if (!this.currentSessionId) return;
    
    const hasPermission = await this.checkLocationPermission();
    if (!hasPermission) return;
    
    Geolocation.getCurrentPosition(
      async (position) => {
        const now = Date.now();
        
        // Enforce 5-minute window
        if (now - this.lastTrackTime < this.TRACK_INTERVAL - 1000) {
          return;
        }
        
        this.lastTrackTime = now;
        
        const trackPoint = {
          id: uuidv4(),
          session_id: this.currentSessionId,
          ts: Math.floor(now / 1000),
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          acc: position.coords.accuracy,
          speed: position.coords.speed,
          heading: position.coords.heading,
        };
        
        await DatabaseService.addTrackPoint(trackPoint);
      },
      (error) => {
        console.error('Location error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
        distanceFilter: 0,
        forceRequestLocation: true,
        showLocationDialog: false,
      }
    );
  }
  
  private static async checkLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      return auth === 'granted' || auth === 'restricted';
    }
    
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted;
    }
    
    return false;
  }
  
  static isTracking(): boolean {
    return this.currentSessionId !== null;
  }
  
  static getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }
}