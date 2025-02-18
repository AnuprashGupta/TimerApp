import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const storedHistory = await AsyncStorage.getItem('completedTimers');
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Timer History</Text>
      <FlatList
        data={history}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.historyItem}>
            <Text style={styles.timerName}>{item.name}</Text>
            <Text style={styles.timerDetails}>Duration: {item.duration}s</Text>
            <Text style={styles.timerDetails}>Completed at: {item.completedAt}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f4f4f4' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  historyItem: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  timerName: { fontSize: 18, fontWeight: 'bold', color: '#1E88E5' },
  timerDetails: { fontSize: 16, color: '#555' },
});

