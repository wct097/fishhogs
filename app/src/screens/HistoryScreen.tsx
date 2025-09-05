import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {DatabaseService} from '../services/database';

const HistoryScreen = () => {
  const navigation = useNavigation();
  const [sessions, setSessions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    loadSessions();
  }, []);
  
  const loadSessions = async () => {
    const data = await DatabaseService.getSessions();
    setSessions(data);
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };
  
  const formatDuration = (start: number, end: number | null) => {
    if (!end) return 'Active';
    
    const duration = end - start;
    const hours = Math.floor(duration / 3600000);
    const minutes = Math.floor((duration % 3600000) / 60000);
    
    return `${hours}h ${minutes}m`;
  };
  
  const renderSession = ({item}: {item: any}) => (
    <TouchableOpacity
      style={styles.sessionItem}
      onPress={() => navigation.navigate('SessionDetail', {sessionId: item.id} as never)}
    >
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionTitle}>{item.title || 'Untitled Session'}</Text>
        <Text style={styles.sessionDate}>{formatDate(item.started_at)}</Text>
      </View>
      <View style={styles.sessionDetails}>
        <Text style={styles.sessionDuration}>
          {formatDuration(item.started_at, item.ended_at)}
        </Text>
        <View style={styles.syncStatus}>
          <Text style={styles.syncText}>
            {item.is_synced ? 'Synced' : 'Not synced'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      {sessions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No sessions yet</Text>
          <Text style={styles.emptySubtext}>Start your first fishing session!</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderSession}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 15,
  },
  sessionItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  sessionDate: {
    fontSize: 14,
    color: '#666',
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionDuration: {
    fontSize: 14,
    color: '#666',
  },
  syncStatus: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#e8f5e9',
  },
  syncText: {
    fontSize: 12,
    color: '#4CAF50',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
  },
});

export default HistoryScreen;