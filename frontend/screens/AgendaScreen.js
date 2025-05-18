import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AgendaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 Agenda</Text>
      <Text style={styles.description}>Affiche tous les événements à venir ici.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f8ff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFD700' },
  description: { fontSize: 18, color: '#333', marginTop: 10, textAlign: 'center' },
});