import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {PermissionsAndroid, Platform} from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import {DatabaseService} from './services/database';
import {useAuthStore} from './stores/authStore';

const queryClient = new QueryClient();

const App: React.FC = () => {
  useEffect(() => {
    // Initialize database
    DatabaseService.initialize();
    
    // Request permissions on Android
    if (Platform.OS === 'android') {
      requestAndroidPermissions();
    }
    
    // Load stored auth token
    useAuthStore.getState().loadStoredToken();
  }, []);
  
  const requestAndroidPermissions = async () => {
    try {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);
    } catch (err) {
      console.warn(err);
    }
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
};

export default App;