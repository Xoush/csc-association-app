import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
  Easing,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
  Image,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import PhoneInput from 'react-native-phone-number-input';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config';

export default function LoginScreen() {
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthdate, setBirthdate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('');
  const [isMember, setIsMember] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [shakeAnim] = useState(new Animated.Value(0));
  const [showLoading, setShowLoading] = useState(false);
  const rocketAnim = useRef(new Animated.Value(0)).current;
  const phoneInput = useRef(null);

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    return today.getFullYear() - birthDate.getFullYear();
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const submitToBackend = async () => {
    try {
      const deviceId = await AsyncStorage.getItem('deviceId');
      if (!deviceId) {
        Alert.alert('Error', 'Device ID not found.');
        return null;
      }
      const payload = {
        firstName: name,
        lastName,
        birthdate: birthdate.toISOString().split('T')[0],
        firebaseToken: 'sampleFirebaseToken123', // TODO: Replace with actual Firebase token
        deviceId,
        phone: phoneNumber,
        gender: gender === 'Homme' ? 'male' : 'female',
        adhesion: isMember,
      };

      const response = await fetch(`${BASE_URL}/api/users/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (response.ok) {
        console.log('✅ User created:', result);
        return result;
      } else {
        console.error('❌ Server error:', result);
        Alert.alert('Error', 'Server error, please try again later.');
        return null;
      }
    } catch (error) {
      console.error('❌ Error sending data:', error);
      Alert.alert('Error', 'Network error, please try again later.');
      return null;
    }
  };

  const launchRocket = (user) => {
    setShowLoading(true);
    Animated.timing(rocketAnim, {
      toValue: -400,
      duration: 1000,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        navigation.navigate('Home', { user });
        setShowLoading(false);
      }, 1500);
    });
  };

  const handleSubmit = async () => {
    if (!name || !lastName || !birthdate || !gender || isMember === null || (isMember === false && !phoneNumber)) {
      shake();
      Alert.alert('😅 Oups !', 'Merci de remplir tous les champs pour continuer ✍️');
      return;
    }
    const result = await submitToBackend();
    if (result && result.user) {
      launchRocket(result.user);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {showLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00BFFF" style={{ marginBottom: 20 }} />
              <Text style={styles.loadingText}>Veuillez patienter...</Text>
            </View>
          ) : (
            <>
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/gps-cs-s/AC9h4npxB8OeM7bT-UmCD0j2_gQUJf0uvM67ikwrNmkDsZB8fS64VAw5O2qQihNMrjMntkvWsfizCeoZpl7-TNdkYyh_xt2SBtZvbZCtFz-0zGjVP0sbOsIPQmqLX-d1tXtrwBQW5JI=s1360-w1360-h1020-rw' }}
                style={styles.logo}
              />
              <Text style={styles.title}>Bienvenue au Centre Socioculturel Bar-le-Duc</Text>

              <Text style={styles.label}>🧒 Ton prénom :</Text>
              <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
                <TextInput style={styles.input} placeholder="Votre prénom" value={name} onChangeText={setName} />
              </Animated.View>

              <Text style={styles.label}>👤 Ton nom :</Text>
              <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
                <TextInput style={styles.input} placeholder="Votre nom" value={lastName} onChangeText={setLastName} />
              </Animated.View>

              <Text style={styles.label}>🎂 Ta Date de naissance :</Text>
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateText}>{birthdate.toDateString()}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={birthdate}
                    mode="date"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) setBirthdate(selectedDate);
                    }}
                  />
                  <TouchableOpacity style={styles.confirmButton} onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.confirmText}>✅ Confirmer</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={styles.label}>👤 Ton genre :</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.optionButton, gender === 'Homme' && styles.selected]}
                  onPress={() => setGender('Homme')}
                >
                  <Text>👦 Homme</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionButton, gender === 'Femme' && styles.selected]}
                  onPress={() => setGender('Femme')}
                >
                  <Text>👧 Femme</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>🏠 Es-tu Adhérent des Centres Socioculturels ?</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.optionButton, isMember === true && styles.selected]}
                  onPress={() => setIsMember(true)}
                >
                  <Text>✅ Oui</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionButton, isMember === false && styles.selected]}
                  onPress={() => setIsMember(false)}
                >
                  <Text>❌ Non</Text>
                </TouchableOpacity>
              </View>

              {isMember === false && (
                <>
                  <Text style={styles.label}>📱 Ton numéro de téléphone :</Text>
                  <PhoneInput
                    ref={phoneInput}
                    defaultValue={phoneNumber}
                    defaultCode="FR"
                    layout="first"
                    onChangeFormattedText={setPhoneNumber}
                  />
                </>
              )}

              <Animated.View style={{ marginTop: 30, transform: [{ translateX: shakeAnim }] }}>
                <TouchableOpacity style={styles.launchButton} onPress={handleSubmit}>
                  <Text style={styles.launchText}>🚀 Continuer</Text>
                </TouchableOpacity>
              </Animated.View>
            </>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 30, justifyContent: 'center', backgroundColor: '#e0f7ff' },
  logo: { width: 300, height: 130, resizeMode: 'contain', alignSelf: 'center', marginBottom: 0 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: '#f9c80e' },
  label: { fontSize: 16, marginBottom: 8, marginTop: 20, color: '#333' },
  input: { borderWidth: 1, borderColor: '#00BFFF', padding: 10, borderRadius: 10, backgroundColor: '#ffffff' },
  dateButton: { borderWidth: 1, borderColor: '#00BFFF', padding: 12, borderRadius: 10, backgroundColor: '#ffffff', alignItems: 'center' },
  dateText: { fontSize: 16, color: '#333' },
  pickerContainer: { backgroundColor: '#FFF', padding: 20, borderRadius: 10, alignItems: 'center' },
  confirmButton: { marginTop: 10, padding: 10, backgroundColor: '#00B894', borderRadius: 10, alignItems: 'center' },
  confirmText: { color: 'white', fontWeight: 'bold' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  optionButton: { padding: 12, backgroundColor: '#f0f9ff', borderRadius: 10, width: '40%', alignItems: 'center', borderWidth: 1, borderColor: '#00BFFF' },
  selected: { backgroundColor: '#f9c80e' },
  launchButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#00BFFF', padding: 15, borderRadius: 10 },
  launchText: { color: 'white', fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 150 },
  loadingText: { fontSize: 18, marginBottom: 20 },
});