import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import {useAuthStore} from '../stores/authStore';
import {SyncService} from '../services/sync';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {
  const {logout} = useAuthStore();
  const [wifiOnly, setWifiOnly] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [imperialUnits, setImperialUnits] = useState(false);
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };
  
  const handleManualSync = async () => {
    try {
      await SyncService.triggerSync();
      Alert.alert('Success', 'Data synced successfully');
    } catch (error) {
      Alert.alert('Error', 'Sync failed. Please check your connection.');
    }
  };
  
  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all cached data. Are you sure?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert('Success', 'Cache cleared');
          },
        },
      ]
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sync Settings</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Auto Sync</Text>
          <Switch
            value={autoSync}
            onValueChange={setAutoSync}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Wi-Fi Only</Text>
          <Switch
            value={wifiOnly}
            onValueChange={setWifiOnly}
          />
        </View>
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleManualSync}
        >
          <Text style={styles.buttonText}>Sync Now</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Units</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Use Imperial Units</Text>
          <Switch
            value={imperialUnits}
            onValueChange={setImperialUnits}
          />
        </View>
        <Text style={styles.settingHint}>
          {imperialUnits ? 'Using inches/lbs' : 'Using cm/kg'}
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <TouchableOpacity
          style={[styles.button, styles.warningButton]}
          onPress={handleClearCache}
        >
          <Text style={styles.buttonText}>Clear Cache</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.about}>
        <Text style={styles.aboutText}>Fishing Tracker v0.0.1</Text>
        <Text style={styles.aboutText}>MVP Build</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    margin: 15,
    marginBottom: 0,
    padding: 15,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingHint: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  warningButton: {
    backgroundColor: '#FF9800',
  },
  dangerButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  about: {
    alignItems: 'center',
    padding: 20,
  },
  aboutText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
  },
});

export default SettingsScreen;