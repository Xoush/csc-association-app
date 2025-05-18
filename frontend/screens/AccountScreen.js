import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import BASE_URL from '../config';

export default function AccountScreen({ route }) {
  const navigation = useNavigation();
  const { user } = route.params || {};

  const [name, setName] = useState(`${user.firstName} ${user.lastName}`);
  const [profilePic, setProfilePic] = useState(user.profilePicture || null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("⚠️ Autorisation refusée !", "Donne l'accès à la caméra dans les paramètres.");
      }
    })();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) setProfilePic(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) setProfilePic(result.assets[0].uri);
  };

  const uploadProfilePicture = async (userId, imageUri) => {
    const formData = new FormData();
    formData.append('profilePicture', {
      uri: imageUri,
      name: 'profile.jpg',
      type: 'image/jpeg',
    });

    try {
      const response = await fetch(`${BASE_URL}/api/users/upload-profile/${userId}`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = await response.json();
      if (response.ok) {
        return data.user;
      } else {
        console.error('Upload error:', data);
        Alert.alert('Error', 'Failed to upload profile picture');
        return null;
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Network error');
      return null;
    }
  };

  const updateUserInfo = async (userId, { firstName, lastName }) => {
    try {
      const response = await fetch(`${BASE_URL}/api/users/${userId}/update-info`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName }),
      });
      const data = await response.json();
      if (response.ok) {
        return data.user;
      } else {
        console.error('Update error:', data);
        Alert.alert('Error', 'Failed to update user info');
        return null;
      }
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Network error');
      return null;
    }
  };

  const handleSave = async () => {
    let updatedUser = { ...user };

    if (name !== `${user.firstName} ${user.lastName}`) {
      const [firstName, lastName] = name.split(' ');
      const result = await updateUserInfo(user._id, { firstName, lastName });
      if (result) updatedUser = result;
    }

    if (profilePic !== user.profilePicture && !profilePic.startsWith('https://')) {
      const uploadResult = await uploadProfilePicture(user._id, profilePic);
      if (uploadResult) updatedUser = { ...updatedUser, ...uploadResult };
    }

    navigation.navigate('Home', { user: updatedUser });
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('deviceId');
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error);
      Alert.alert('Erreur', 'Impossible de se déconnecter pour le moment.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View style={{ opacity: fadeAnim, width: '100%', alignItems: 'center' }}>
          <Text style={styles.title}>👤 Modifier ton profil</Text>

          <TouchableOpacity onPress={pickImage}>
            {profilePic ? (
              <Image source={{ uri: profilePic.startsWith('https://') ? profilePic : `${BASE_URL}${profilePic}` }} style={styles.profileImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={{ textAlign: 'center', color: '#555' }}>📷 Ajouter une photo</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
            <Text style={styles.photoButtonText}>📸 Prendre une photo</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Ton nom"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>✅ Sauvegarder</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Home', { user })}>
            <Text style={styles.homeButtonText}>🏠 Retour à l'accueil</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.canceled} onPress={handleLogout}>
            <Text style={styles.canceledText}>❌ Se déconnecter</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 30, backgroundColor: '#f4faff', justifyContent: 'center', alignItems: 'center', flexGrow: 1 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#007BFF', marginBottom: 30 },
  profileImage: { width: 120, height: 120, borderRadius: 60, borderColor: '#FFD700', borderWidth: 3, marginBottom: 12 },
  imagePlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  input: { width: '100%', backgroundColor: '#fff', padding: 12, borderRadius: 10, borderColor: '#00BFFF', borderWidth: 1, marginVertical: 12, fontSize: 16 },
  photoButton: { backgroundColor: '#FFA500', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, marginBottom: 15 },
  photoButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  saveButton: { backgroundColor: '#28a745', paddingVertical: 14, paddingHorizontal: 25, borderRadius: 10, marginTop: 10, width: '100%' },
  saveButtonText: { color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: 17 },
  homeButton: { marginTop: 20, backgroundColor: '#007BFF', paddingVertical: 14, paddingHorizontal: 25, borderRadius: 10, width: '100%' },
  homeButtonText: { color: 'white', fontWeight: 'bold', fontSize: 17, textAlign: 'center' },
  canceled: { marginTop: 20, backgroundColor: '#8b0000', paddingVertical: 14, paddingHorizontal: 25, borderRadius: 10, width: '100%' },
  canceledText: { color: 'white', textAlign: 'center', fontSize: 17, fontWeight: 'bold' },
});