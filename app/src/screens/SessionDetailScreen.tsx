import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {DatabaseService} from '../services/database';

const SessionDetailScreen = () => {
  const route = useRoute();
  const {sessionId} = route.params as {sessionId: string};
  const [session, setSession] = useState<any>(null);
  const [trackPoints, setTrackPoints] = useState<any[]>([]);
  const [catches, setCatches] = useState<any[]>([]);
  
  useEffect(() => {
    loadSessionData();
  }, []);
  
  const loadSessionData = async () => {
    const sessions = await DatabaseService.getSessions();
    const sessionData = sessions.find(s => s.id === sessionId);
    setSession(sessionData);
    
    const points = await DatabaseService.getTrackPoints(sessionId);
    setTrackPoints(points);
    
    const catchList = await DatabaseService.getCatches(sessionId);
    setCatches(catchList);
  };
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  const formatDuration = (start: number, end: number | null) => {
    if (!end) return 'Still active';
    
    const duration = end - start;
    const hours = Math.floor(duration / 3600000);
    const minutes = Math.floor((duration % 3600000) / 60000);
    
    return `${hours} hours, ${minutes} minutes`;
  };
  
  if (!session) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{session.title || 'Untitled Session'}</Text>
        <Text style={styles.date}>{formatDate(session.started_at)}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Info</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Duration:</Text>
          <Text style={styles.infoValue}>
            {formatDuration(session.started_at, session.ended_at)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Track Points:</Text>
          <Text style={styles.infoValue}>{trackPoints.length}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total Catches:</Text>
          <Text style={styles.infoValue}>{catches.length}</Text>
        </View>
        {session.notes && (
          <View style={styles.notes}>
            <Text style={styles.infoLabel}>Notes:</Text>
            <Text style={styles.notesText}>{session.notes}</Text>
          </View>
        )}
      </View>
      
      {catches.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Catches</Text>
          {catches.map((catch) => (
            <View key={catch.id} style={styles.catchItem}>
              <Text style={styles.catchSpecies}>{catch.species}</Text>
              <View style={styles.catchDetails}>
                {catch.length && (
                  <Text style={styles.catchMeasurement}>Length: {catch.length}cm</Text>
                )}
                {catch.weight && (
                  <Text style={styles.catchMeasurement}>Weight: {catch.weight}kg</Text>
                )}
              </View>
              {catch.notes && (
                <Text style={styles.catchNotes}>{catch.notes}</Text>
              )}
              <Text style={styles.catchTime}>
                {new Date(catch.ts * 1000).toLocaleTimeString()}
              </Text>
            </View>
          ))}
        </View>
      )}
      
      {trackPoints.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GPS Track</Text>
          <Text style={styles.infoValue}>
            {trackPoints.length} points recorded
          </Text>
          <Text style={styles.trackInfo}>
            First: {new Date(trackPoints[0].ts * 1000).toLocaleTimeString()}
          </Text>
          <Text style={styles.trackInfo}>
            Last: {new Date(trackPoints[trackPoints.length - 1].ts * 1000).toLocaleTimeString()}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  date: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  section: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  notes: {
    marginTop: 10,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
    lineHeight: 20,
  },
  catchItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
    marginBottom: 15,
  },
  catchSpecies: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  catchDetails: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  catchMeasurement: {
    fontSize: 14,
    color: '#666',
    marginRight: 15,
  },
  catchNotes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 5,
  },
  catchTime: {
    fontSize: 12,
    color: '#999',
  },
  trackInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});

export default SessionDetailScreen;