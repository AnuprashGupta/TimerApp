import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const storedTimers = await AsyncStorage.getItem('timers');
    if (storedTimers) {
      const completedTimers = JSON.parse(storedTimers).filter(timer => timer.status === 'Completed');
      setHistory(completedTimers);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Timer History</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.timerItem}>
            <Text>{item.name} - Completed at {new Date(item.id).toLocaleTimeString()}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  timerItem: { padding: 10, borderBottomWidth: 1 }
});
