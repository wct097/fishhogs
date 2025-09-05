import axios from 'axios';
import {API_ENDPOINTS} from '../config/api';

export interface HealthStatus {
  api: boolean;
  database: boolean;
  storage: boolean;
  timestamp: string;
}

export class HealthService {
  static async checkBackendHealth(): Promise<HealthStatus> {
    try {
      const response = await axios.get(API_ENDPOINTS.HEALTH.CHECK, {
        timeout: 5000,
      });
      
      return {
        api: response.data.services.api === 'healthy' || response.data.services.api === 'ok',
        database: response.data.services.database === 'healthy' || response.data.services.database === 'ok',
        storage: response.data.services.storage === 'healthy',
        timestamp: response.data.timestamp,
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        api: false,
        database: false,
        storage: false,
        timestamp: new Date().toISOString(),
      };
    }
  }
  
  static async checkApiHealth(): Promise<boolean> {
    try {
      const response = await axios.get(API_ENDPOINTS.HEALTH.API, {
        timeout: 3000,
      });
      return response.data.status === 'ok';
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }
  
  static async testConnectivity(): Promise<{
    backend: boolean;
    database: boolean;
    message: string;
  }> {
    try {
      const health = await this.checkBackendHealth();
      
      if (!health.api) {
        return {
          backend: false,
          database: false,
          message: 'Cannot connect to backend server',
        };
      }
      
      if (!health.database) {
        return {
          backend: true,
          database: false,
          message: 'Backend is running but database is not accessible',
        };
      }
      
      return {
        backend: true,
        database: true,
        message: 'All services are healthy',
      };
    } catch (error: any) {
      return {
        backend: false,
        database: false,
        message: error.message || 'Connection failed',
      };
    }
  }
}