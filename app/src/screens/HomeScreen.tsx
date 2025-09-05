import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSessionStore} from '../stores/sessionStore';
import {TrackingService} from '../services/tracking';
import {SyncService} from '../services/sync';
import {HealthService} from '../services/health';

const HomeScreen = () => {
  const navigation = useNavigation();
  const {activeSession, startSession, stopSession, loadSessions} = useSessionStore();
  const [backendStatus, setBackendStatus] = useState<string>('Unknown');
  
  useEffect(() => {
    loadSessions();
    checkHealth();
  }, []);
  
  const checkHealth = async () => {
    const result = await HealthService.testConnectivity();
    setBackendStatus(result.backend ? 'Connected' : 'Disconnected');
  };
  
  const handleStartSession = async () => {
    try {
      await startSession();
      navigation.navigate('ActiveSession' as never);
    } catch (error) {
      Alert.alert('Error', 'Failed to start session');
    }
  };
  
  const handleStopSession = async () => {
    Alert.alert(
      'End Session',
      'Are you sure you want to end the current session?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'End',
          style: 'destructive',
          onPress: async () => {
            await stopSession();
          },
        },
      ]
    );
  };
  
  const handleSync = async () => {
    try {
      await SyncService.triggerSync();
      Alert.alert('Success', 'Sync completed');
    } catch (error) {
      Alert.alert('Sync Failed', 'Please check your connection');
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fishing Tracker</Text>
        <Text style={styles.subtitle}>
          {activeSession ? 'Session Active' : 'Ready to Fish'}
        </Text>
      </View>
      
      <View style={styles.mainAction}>
        {!activeSession ? (
          <TouchableOpacity
            style={[styles.button, styles.startButton]}
            onPress={handleStartSession}
          >
            <Text style={styles.buttonText}>Start Session</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.button, styles.activeButton]}
              onPress={() => navigation.navigate('ActiveSession' as never)}
            >
              <Text style={styles.buttonText}>View Active Session</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.stopButton]}
              onPress={handleStopSession}
            >
              <Text style={styles.buttonText}>Stop Session</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleSync}
        >
          <Text style={styles.secondaryButtonText}>Sync Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('History' as never)}
        >
          <Text style={styles.secondaryButtonText}>View History</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.status}>
        <Text style={styles.statusText}>
          GPS: {TrackingService.isTracking() ? 'Tracking' : 'Idle'}
        </Text>
        <Text style={styles.statusText}>
          Session: {activeSession ? 'Active' : 'Inactive'}
        </Text>
        <Text style={styles.statusText}>
          Backend: {backendStatus}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
  },
  mainAction: {
    padding: 20,
  },
  actions: {
    padding: 20,
    paddingTop: 0,
  },
  button: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  activeButton: {
    backgroundColor: '#2196F3',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 18,
  },
  status: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});

export default HomeScreen;