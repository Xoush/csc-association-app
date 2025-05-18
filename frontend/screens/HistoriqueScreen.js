import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import BASE_URL from '../config';

export default function HistoriqueScreen({ route }) {
  const { user } = route.params || {};
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/notifications/group/${user.group}/history?userId=${user._id}`);
        const data = await response.json();
        if (response.ok) {
          setNotifications(data);
        } else {
          console.error('Error fetching notifications:', data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    fetchNotifications();
  }, [user]);

  const respondToNotification = async (notificationId, response) => {
    try {
      const res = await fetch(`${BASE_URL}/api/notifications/${notificationId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, response }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotifications(notifications.map(notif =>
          notif._id === notificationId ? { ...notif, userResponse: response } : notif
        ));
      } else {
        console.error('Error responding:', data);
        Alert.alert('Error', 'Failed to respond');
      }
    } catch (error) {
      console.error('Error responding:', error);
      Alert.alert('Error', 'Network error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📜 Historique</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.notificationItem}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationMessage}>{item.message}</Text>
            {item.imageUrl && <Image source={{ uri: `${BASE_URL}${item.imageUrl}` }} style={styles.notificationImage} />}
            <Text>Sent at: {new Date(item.sentAt).toLocaleString()}</Text>
            <Text>Interested: {item.interestedCount}</Text>
            {item.isInteractive && !item.userResponse && (
              <View style={styles.responseButtons}>
                <TouchableOpacity
                  style={styles.responseButton}
                  onPress={() => respondToNotification(item._id, 'available')}
                >
                  <Text style={styles.responseText}>✅ Available</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.responseButton}
                  onPress={() => respondToNotification(item._id, 'not available')}
                >
                  <Text style={styles.responseText}>❌ Not Available</Text>
                </TouchableOpacity>
              </View>
            )}
            {item.userResponse && <Text style={styles.userResponse}>Your response: {item.userResponse}</Text>}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fef5e7' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#ff5733', marginBottom: 20, textAlign: 'center' },
  notificationItem: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2 },
  notificationTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  notificationMessage: { fontSize: 16, color: '#666', marginVertical: 5 },
  notificationImage: { width: '100%', height: 150, borderRadius: 10, marginVertical: 10 },
  responseButtons: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  responseButton: { backgroundColor: '#00BFFF', padding: 10, borderRadius: 5 },
  responseText: { color: '#fff', fontWeight: 'bold' },
  userResponse: { fontSize: 14, color: '#28a745', marginTop: 10 },
});