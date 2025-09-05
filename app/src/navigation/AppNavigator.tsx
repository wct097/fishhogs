import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useAuthStore} from '../stores/authStore';

// Auth screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Main screens
import HomeScreen from '../screens/HomeScreen';
import ActiveSessionScreen from '../screens/ActiveSessionScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SessionDetailScreen from '../screens/SessionDetailScreen';
import AddCatchScreen from '../screens/AddCatchScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const {isAuthenticated} = useAuthStore();
  
  return (
    <Stack.Navigator>
      {!isAuthenticated ? (
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{title: 'Create Account'}}
          />
        </>
      ) : (
        <>
          <Stack.Screen 
            name="MainTabs" 
            component={MainTabs}
            options={{headerShown: false}}
          />
          <Stack.Screen 
            name="ActiveSession" 
            component={ActiveSessionScreen}
            options={{title: 'Active Session'}}
          />
          <Stack.Screen 
            name="SessionDetail" 
            component={SessionDetailScreen}
            options={{title: 'Session Details'}}
          />
          <Stack.Screen 
            name="AddCatch" 
            component={AddCatchScreen}
            options={{title: 'Log Catch'}}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;