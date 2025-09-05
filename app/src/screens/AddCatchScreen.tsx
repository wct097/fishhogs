import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
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

const SPECIES_LIST = [
  'Bass',
  'Trout',
  'Pike',
  'Salmon',
  'Catfish',
  'Bluegill',
  'Crappie',
  'Walleye',
  'Perch',
  'Other',
];

const AddCatchScreen = () => {
  const navigation = useNavigation();
  const {activeSession} = useSessionStore();
  const [species, setSpecies] = useState('');
  const [length, setLength] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState<{lat: number; lon: number} | null>(null);
  
  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        Alert.alert('Success', 'Location captured');
      },
      (error) => {
        Alert.alert('Error', 'Failed to get location');
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
  };
  
  const handleSave = async () => {
    if (!activeSession) {
      Alert.alert('Error', 'No active session');
      return;
    }
    
    if (!species) {
      Alert.alert('Error', 'Please select a species');
      return;
    }
    
    try {
      const catchData = {
        id: uuidv4(),
        session_id: activeSession.id,
        ts: Math.floor(Date.now() / 1000),
        species,
        length: length ? parseFloat(length) : null,
        weight: weight ? parseFloat(weight) : null,
        notes: notes || null,
        lat: location?.lat || null,
        lon: location?.lon || null,
      };
      
      await DatabaseService.addCatch(catchData);
      Alert.alert('Success', 'Catch logged successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save catch');
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Species *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.speciesList}>
            {SPECIES_LIST.map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.speciesItem,
                  species === s && styles.speciesItemSelected,
                ]}
                onPress={() => setSpecies(s)}
              >
                <Text
                  style={[
                    styles.speciesText,
                    species === s && styles.speciesTextSelected,
                  ]}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.label}>Length (cm)</Text>
        <TextInput
          style={styles.input}
          value={length}
          onChangeText={setLength}
          keyboardType="numeric"
          placeholder="Enter length"
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.label}>Weight (kg)</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          placeholder="Enter weight"
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          placeholder="Add notes..."
        />
      </View>
      
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.button, styles.locationButton]}
          onPress={getCurrentLocation}
        >
          <Text style={styles.buttonText}>
            {location ? 'Location Captured' : 'Capture Location'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>Save Catch</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  speciesList: {
    flexDirection: 'row',
  },
  speciesItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  speciesItemSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  speciesText: {
    color: '#333',
    fontSize: 14,
  },
  speciesTextSelected: {
    color: '#fff',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  locationButton: {
    backgroundColor: '#9C27B0',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#999',
    flex: 1,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddCatchScreen;