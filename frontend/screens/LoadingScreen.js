import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { useNavigation } from '@react-navigation/native';
import BASE_URL from '../config'; // Adjust this path as needed

export default function LoadingScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    const checkDeviceId = async () => {
      try {
        // Retrieve deviceId from AsyncStorage
        let deviceId = await AsyncStorage.getItem('deviceId');
        if (!deviceId) {
          // Generate a new deviceId if it doesn’t exist
          deviceId = uuidv4();
          await AsyncStorage.setItem('deviceId', deviceId);
          console.log('Generated new deviceId:', deviceId); // Debugging
        } else {
          console.log('Retrieved deviceId:', deviceId); // Debugging
        }

        // Check if the user exists via API
        const response = await fetch(`${BASE_URL}/api/users/check-device/${deviceId}`);
        const data = await response.json();

        // Navigate based on API response
        if (data.exists) {
          navigation.replace('Home', { user: data.user });
        } else {
          navigation.replace('Login');
        }
      } catch (error) {
        // Handle errors and fallback to Login
        console.error('Error checking deviceId:', error);
        navigation.replace('Login');
      }
    };

    checkDeviceId();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});