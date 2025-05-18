import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import BASE_URL from '../config';

export default function GalerieScreen({ route }) {
  const { user } = route.params || {};
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/notifications/user/${user._id}/photos`);
        const data = await response.json();
        if (response.ok) {
          setPhotos(data);
        } else {
          console.error('Error fetching photos:', data);
        }
      } catch (error) {
        console.error('Error fetching photos:', error);
      }
    };
    fetchPhotos();
  }, [user]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🖼️ Galerie de Photos</Text>
      <FlatList
        data={photos}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        renderItem={({ item }) => (
          <Image source={{ uri: `${BASE_URL}${item}` }} style={styles.photo} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#e3f2fd' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#007bff', marginBottom: 20, textAlign: 'center' },
  photo: { width: '45%', height: 150, margin: 5, borderRadius: 10 },
});