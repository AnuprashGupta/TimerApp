import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import ProgressBar from 'react-native-progress/Bar';

export default function HomeScreen() {
  const [timers, setTimers] = useState([]);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('Workout');
  const [expandedCategories, setExpandedCategories] = useState({});
  const categories = ['Workout', 'Study', 'Break', 'Cooking'];
  const [modalVisible, setModalVisible] = useState(false);
  const [completedTimer, setCompletedTimer] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    loadTimers();
  }, []);

  const loadTimers = async () => {
    const storedTimers = await AsyncStorage.getItem('ongoingTimers');
    if (storedTimers) {
      setTimers(JSON.parse(storedTimers));
    }
  };

  const saveTimers = async (newTimers) => {
    await AsyncStorage.setItem('ongoingTimers', JSON.stringify(newTimers));
  };

  const saveCompletedTimer = async (completedTimer) => {
    try {
      const storedHistory = await AsyncStorage.getItem('completedTimers');
      const history = storedHistory ? JSON.parse(storedHistory) : [];
      
      history.push(completedTimer);
      await AsyncStorage.setItem('completedTimers', JSON.stringify(history));
    } catch (error) {
      console.error("Error saving completed timer:", error);
    }
  };

  const addTimer = () => {
    if (!name || !duration || !category) return;
    const newTimer = { 
      id: Date.now(), 
      name, 
      duration: parseInt(duration), 
      category, 
      remaining: parseInt(duration), 
      status: 'Paused',
      interval: null
    };
    const updatedTimers = [...timers, newTimer];
    setTimers((prevTimers) => [...prevTimers, newTimer]);
    saveTimers(updatedTimers);
    setName('');
    setDuration('');
    setCategory('Workout');
  };
  const startTimer = (id) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) => {
        if (timer.id === id && timer.status !== 'Running') {
          const interval = setInterval(() => {
            setTimers((currentTimers) =>
              currentTimers.map((t) => {
                if (t.id === id && t.remaining > 0) {
                  return { ...t, remaining: t.remaining - 1 };
                } else if (t.id === id && t.remaining === 0) {
                  clearInterval(interval);
                  const completedAt = new Date().toLocaleString(); 
  
                  const completedTimer = { ...t, status: 'Completed', completedAt };
  
                  saveCompletedTimer(completedTimer); 
                  setCompletedTimer(completedTimer);
                  setModalVisible(true);
  
                  return completedTimer;
                }
                return t;
              })
            );
          }, 1000);
          return { ...timer, status: 'Running', interval };
        }
        return timer;
      })
    );
  };
  

  const pauseTimer = (id) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) => {
        if (timer.id === id && timer.status === 'Running') {
          clearInterval(timer.interval);
          return { ...timer, status: 'Paused' };
        }
        return timer;
      })
    );
  };

  const resetTimer = (id) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) => {
        if (timer.id === id) {
          clearInterval(timer.interval);
          return { ...timer, remaining: timer.duration, status: 'Paused' };
        }
        return timer;
      })
    );
  };

  const startAllTimers = (category) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) => {
        if (timer.category === category && timer.status !== 'Running') {
          const interval = setInterval(() => {
            setTimers((currentTimers) =>
              currentTimers.map((t) => {
                if (t.id === timer.id && t.remaining > 0) {
                  return { ...t, remaining: t.remaining - 1 };
                } else if (t.id === timer.id && t.remaining === 0) {
                  clearInterval(interval);
                  const completedAt = new Date().toLocaleString();
                  const completedTimer = { ...t, status: 'Completed', completedAt };
                  saveCompletedTimer(completedTimer);
                  return completedTimer;
                }
                return t;
              })
            );
          }, 1000);
          return { ...timer, status: 'Running', interval };
        }
        return timer;
      })
    );
  };
  
  const pauseAllTimers = (category) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) => {
        if (timer.category === category && timer.status === 'Running') {
          clearInterval(timer.interval);
          return { ...timer, status: 'Paused' };
        }
        return timer;
      })
    );
  };
  
  const resetAllTimers = (category) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) => {
        if (timer.category === category) {
          clearInterval(timer.interval);
          return { ...timer, remaining: timer.duration, status: 'Paused' };
        }
        return timer;
      })
    );
  };

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add Timer</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Name"  
        placeholderTextColor="#9CA3AF" 
        value={name} 
        onChangeText={setName} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Duration (seconds)"    
        placeholderTextColor="#9CA3AF"  
        value={duration} 
        onChangeText={setDuration} 
        keyboardType="numeric" 
      />
      <View style={styles.pickerContainer}>
        <Picker 
          selectedValue={category} 
          onValueChange={(itemValue) => setCategory(itemValue)} 
          style={styles.picker}
        >
          {categories.map((cat) => (
            <Picker.Item key={cat} label={cat} value={cat} />
          ))}
        </Picker>
      </View>
      <Button title="Add Timer" onPress={addTimer} />
      <Button title="View History" onPress={() => navigation.navigate('History')} />
      
      <FlatList
  data={categories}
  keyExtractor={(item) => item}
  renderItem={({ item: category }) => (
    <View style={styles.categoryContainer}>
      <TouchableOpacity onPress={() => toggleCategory(category)} style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>{category} ({timers.filter(t => t.category === category).length})</Text>
      </TouchableOpacity>

      {expandedCategories[category] && (
        <>
          <View style={styles.buttonRow}>
            <Button title="Start All" onPress={() => startAllTimers(category)} />
            <Button title="Pause All" onPress={() => pauseAllTimers(category)} />
            <Button title="Reset All" onPress={() => resetAllTimers(category)} />
          </View>

          <FlatList
            data={timers.filter(t => t.category === category)}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const progress = 1 - item.remaining / item.duration;
              const percentage = Math.round(progress * 100);
              return (
                <View style={styles.timerItem}>
                  <Text>{item.name} ({item.remaining}s)</Text>
                  <Text>Status: {item.status}</Text>

                  <ProgressBar progress={progress} width={200} color={progress > 0.5 ? "#4CAF50" : "#FF9800"} />
                  <Text>{percentage}% Completed</Text>

                  <View style={styles.buttonRow}>
                    <Button title="Start" onPress={() => startTimer(item.id)} />
                    <Button title="Pause" onPress={() => pauseTimer(item.id)} />
                    <Button title="Reset" onPress={() => resetTimer(item.id)} />
                  </View>
                </View>
              );
            }}
          />
        </>
      )}
    </View>
  )}
/>

      {/* <FlatList
        data={categories}
        keyExtractor={(item) => item}
        renderItem={({ item: category }) => (
          
          <View style={styles.categoryContainer}>
            <TouchableOpacity onPress={() => toggleCategory(category)} style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>{category} ({timers.filter(t => t.category === category).length})</Text>
            </TouchableOpacity>
            {expandedCategories[category] && (
              <FlatList
                data={timers.filter(t => t.category === category)}
                
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                  const progress = 1 - item.remaining / item.duration;
                  const percentage = Math.round(progress * 100); 
                  return (
                    <View style={styles.timerItem}>
                      <Text>{item.name} ({item.remaining}s)</Text>
                      <Text>Status: {item.status}</Text>
                
          
                      <ProgressBar progress={progress} width={200} color={progress > 0.5 ? "#4CAF50" : "#FF9800"} />
                      <Text>{percentage}% Remaining</Text>
                
                      <View style={styles.buttonRow}>
                        <Button title="Start" onPress={() => startTimer(item.id)} />
                        <Button title="Pause" onPress={() => pauseTimer(item.id)} />
                        <Button title="Reset" onPress={() => resetTimer(item.id)} />
                      </View>
                    </View>
                  );
                }}
              />
            )}
          </View>
        )}
      /> */}

      <Modal visible={modalVisible} transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Timer Completed: {completedTimer?.name}</Text>
            <Text>Completed At: {completedTimer?.completedAt}</Text>
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 20, fontWeight: 'bold' },
  input: { borderWidth: 1, padding: 8, marginVertical: 5 },
  timerItem: { padding: 10, borderBottomWidth: 1 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { padding: 20, backgroundColor: 'white', borderRadius: 10 },
  pickerContainer: { borderWidth: 1, padding: 8, marginVertical: 5 },
  picker: { height: 50, width: '100%' , color:"#000"},
  categoryContainer: { marginVertical: 10 },
  categoryHeader: { backgroundColor: '#ddd', padding: 10 },
  categoryTitle: { fontSize: 18, fontWeight: 'bold' },
});

