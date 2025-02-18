import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const [timers, setTimers] = useState([]);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [completedTimer, setCompletedTimer] = useState(null);
  const [categories, setCategories] = useState({});
  const navigation = useNavigation();

  useEffect(() => {
    loadTimers();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) => prevTimers.map(timer => {
        if (timer.status === 'Running' && timer.remainingTime > 0) {
          if (timer.remainingTime === Math.floor(timer.duration / 2)) {
            alert(`Halfway alert for ${timer.name}!`);
          }
          return { ...timer, remainingTime: timer.remainingTime - 1 };
        } else if (timer.status === 'Running' && timer.remainingTime === 0) {
          setCompletedTimer(timer);
          setModalVisible(true);
          return { ...timer, status: 'Completed' };
        }
        return timer;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadTimers = async () => {
    const storedTimers = await AsyncStorage.getItem('timers');
    if (storedTimers) {
      const parsedTimers = JSON.parse(storedTimers);
      setTimers(parsedTimers);
      groupTimersByCategory(parsedTimers);
    }
  };

  const saveTimers = async (newTimers) => {
    await AsyncStorage.setItem('timers', JSON.stringify(newTimers));
    groupTimersByCategory(newTimers);
  };

  const addTimer = () => {
    if (!name || !duration || !category) return;
    const newTimer = { id: Date.now(), name, duration: parseInt(duration), category, remainingTime: parseInt(duration), status: 'Paused' };
    const updatedTimers = [...timers, newTimer];
    setTimers(updatedTimers);
    saveTimers(updatedTimers);
    setName('');
    setDuration('');
    setCategory('');
  };

  const updateTimerStatus = (id, status) => {
    const updatedTimers = timers.map(timer => timer.id === id ? { ...timer, status } : timer);
    setTimers(updatedTimers);
    saveTimers(updatedTimers);
  };

  const groupTimersByCategory = (timersList) => {
    const grouped = {};
    timersList.forEach(timer => {
      if (!grouped[timer.category]) grouped[timer.category] = [];
      grouped[timer.category].push(timer);
    });
    setCategories(grouped);
  };

  return (
    <ScrollView>
    <View style={styles.container}>
      <Text style={styles.title}>Timer App</Text>
      <TextInput style={styles.input} placeholder="Timer Name"    placeholderTextColor="#9CA3AF" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Duration (seconds)"    placeholderTextColor="#9CA3AF" value={duration} keyboardType="numeric" onChangeText={setDuration} />
      <TextInput style={styles.input} placeholder="Category"   placeholderTextColor="#9CA3AF" value={category} onChangeText={setCategory} />
      <Button title="Add Timer" onPress={addTimer} />
      <Button title="View History" onPress={() => navigation.navigate('History')} />
      {Object.keys(categories).map(category => (
        <View key={category}>
          <Text style={styles.categoryTitle}>{category}</Text>
          <FlatList
            data={categories[category]}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.timerItem}>
                <Text>{item.name} - {item.remainingTime}s ({item.status})</Text>
                {/* <ProgressBarAndroid styleAttr="Horizontal" indeterminate={false} progress={item.remainingTime / item.duration} /> */}
                <Button title="Start" onPress={() => updateTimerStatus(item.id, 'Running')} />
                <Button title="Pause" onPress={() => updateTimerStatus(item.id, 'Paused')} />
                <Button title="Reset" onPress={() => updateTimerStatus(item.id, 'Paused')} />
              </View>
            )}
          />
        </View>
      ))}
      <Modal visible={modalVisible} transparent>
        <View style={styles.modalContainer}>
          <Text>Congratulations! {completedTimer?.name} timer completed.</Text>
          <Button title="OK" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
    </ScrollView>

  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 , color:"#000"},
  categoryTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 15 },
  timerItem: { padding: 10, borderBottomWidth: 1 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }
});