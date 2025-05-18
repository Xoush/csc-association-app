import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import BASE_URL from '../config';

export default function HomeScreen({ route }) {
  const navigation = useNavigation();
  const { user } = route.params || {};

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleImagePress = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 1.1, duration: 150, useNativeDriver: true }),
      Animated.timing(bounceAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <LinearGradient colors={['#e3f2fd', '#FFF9C4']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.returnButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>🔁 Retour</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleImagePress}>
          {user.profilePicture ? (
            <Animated.Image
              source={{ uri: `${BASE_URL}${user.profilePicture}` }}
              style={[styles.profileImage, { transform: [{ scale: bounceAnim }] }]}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>📸 Ajouter une photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.accountButton} onPress={() => navigation.navigate('Account', { user })}>
          <Text style={styles.buttonText}>👤 Compte</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.welcomeText}>Bienvenue, {fullName} 👋</Text>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Agenda', { user })}>
          <Text style={styles.cardTitle}>🗓️ Agenda</Text>
          <Text style={styles.cardDesc}>📍 Consulte les prochains événements et activités organisés.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Historique', { user })}>
          <Text style={styles.cardTitle}>🗂️ Historique & Notifications</Text>
          <Text style={styles.cardDesc}>🔎 Voir les événements et les mises à jour pour {user.group}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Galerie', { user })}>
          <Text style={styles.cardTitle}>📸 Galerie Photos</Text>
          <Text style={styles.cardDesc}>🖼️ Découvre les images des activités !</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.websiteContainer}>
        <Text style={styles.websiteText}>
          🔗 Pour plus d'infos, visite notre site :{' '}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL('https://cscbarleduc.centres-sociaux.fr')}
          >
            www.cscbarleduc.centres-sociaux.fr
          </Text>
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  returnButton: { backgroundColor: '#4FC3F7', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, elevation: 4 },
  accountButton: { backgroundColor: '#FFB74D', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, elevation: 4 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  profileImage: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#FFD54F' },
  imagePlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ECEFF1', justifyContent: 'center', alignItems: 'center' },
  imagePlaceholderText: { color: '#607D8B', textAlign: 'center', fontSize: 11, fontStyle: 'italic' },
  welcomeText: { fontSize: 26, fontWeight: '700', color: '#1E88E5', textAlign: 'center', marginBottom: 25 },
  content: { flex: 1, alignItems: 'center' },
  card: { backgroundColor: '#fff', width: '100%', padding: 22, borderRadius: 20, marginBottom: 22, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 8 },
  cardTitle: { fontSize: 20, fontWeight: '600', color: '#37474F', marginBottom: 10 },
  cardDesc: { fontSize: 15, color: '#546E7A', lineHeight: 22 },
  websiteContainer: { marginTop: 40, alignItems: 'center', marginBottom: 20 },
  websiteText: { fontSize: 14, color: '#607D8B', textAlign: 'center' },
  link: { color: '#1E88E5', fontWeight: 'bold', textDecorationLine: 'underline' },
});