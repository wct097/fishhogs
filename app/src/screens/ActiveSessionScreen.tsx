import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSessionStore} from '../stores/sessionStore';
import {DatabaseService} from '../services/database';
import {v4 as uuidv4} from 'uuid';
import Geolocation from 'react-native-geolocation-service';

const ActiveSessionScreen = () => {
  const navigation = useNavigation();
  const {activeSession, stopSession} = useSessionStore();
  const [trackPoints, setTrackPoints] = useState<any[]>([]);
  const [catches, setCatches] = useState<any[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  useEffect(() => {
    if (!activeSession) {
      navigation.goBack();
      return;
    }
    
    loadSessionData();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - activeSession.started_at;
      setElapsedTime(Math.floor(elapsed / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activeSession]);
  
  const loadSessionData = async () => {
    if (!activeSession) return;
    
    const points = await DatabaseService.getTrackPoints(activeSession.id);
    const catchList = await DatabaseService.getCatches(activeSession.id);
    
    setTrackPoints(points);
    setCatches(catchList);
  };
  
  const handleTakePhoto = () => {
    Alert.alert('Photo', 'Photo capture not implemented in MVP');
  };
  
  const handleAddCatch = () => {
    navigation.navigate('AddCatch' as never);
  };
  
  const handleEndSession = async () => {
    Alert.alert(
      'End Session',
      'Are you sure you want to end this session?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'End',
          style: 'destructive',
          onPress: async () => {
            await stopSession();
            navigation.goBack();
          },
        },
      ]
    );
  };
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.timer}>{formatTime(elapsedTime)}</Text>
        <Text style={styles.title}>{activeSession?.title}</Text>
      </View>
      
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{trackPoints.length}</Text>
          <Text style={styles.statLabel}>Track Points</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{catches.length}</Text>
          <Text style={styles.statLabel}>Catches</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.photoButton]}
          onPress={handleTakePhoto}
        >
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.catchButton]}
          onPress={handleAddCatch}
        >
          <Text style={styles.buttonText}>Log Catch</Text>
        </TouchableOpacity>
      </View>
      
      {catches.length > 0 && (
        <View style={styles.catches}>
          <Text style={styles.sectionTitle}>Recent Catches</Text>
          {catches.slice(0, 3).map((catch) => (
            <View key={catch.id} style={styles.catchItem}>
              <Text style={styles.catchSpecies}>{catch.species}</Text>
              <Text style={styles.catchDetails}>
                {catch.length ? `${catch.length}cm` : ''} 
                {catch.weight ? ` • ${catch.weight}kg` : ''}
              </Text>
            </View>
          ))}
        </View>
      )}
      
      <TouchableOpacity
        style={[styles.button, styles.endButton]}
        onPress={handleEndSession}
      >
        <Text style={styles.buttonText}>End Session</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  title: {
    fontSize: 18,
    color: '#fff',
    marginTop: 5,
  },
  stats: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  actions: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  photoButton: {
    backgroundColor: '#9C27B0',
    marginRight: 10,
  },
  catchButton: {
    backgroundColor: '#4CAF50',
    marginLeft: 10,
  },
  endButton: {
    backgroundColor: '#f44336',
    margin: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  catches: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  catchItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  catchSpecies: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  catchDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});

export default ActiveSessionScreen;