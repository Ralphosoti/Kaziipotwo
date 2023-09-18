import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useUserContext } from "../userContext";
import firebase from '../firebase';

const TaskListComplete = () => {
  const { user } = useUserContext(); 
  const [tasks, setTasks] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = firebase.firestore().collection('tasks').where('user', '==', user.uid).orderBy('date', 'desc')
    .onSnapshot(snapshot => {
      const tasksData = [];
      snapshot.forEach(doc => {
        tasksData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setTasks(tasksData);
      setIsLoading(false); 
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (taskId) => {
    try {
      await firebase.firestore().collection('tasks').doc(taskId).delete();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleProgressChange = async (taskId, progress) => {
    try {
      await firebase.firestore().collection('tasks').doc(taskId).update({ progress });
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const handlePriorityChange = async (taskId, priority) => {
    try {
      await firebase.firestore().collection('tasks').doc(taskId).update({ priority });
    } catch (error) {
      console.error("Error updating priority:", error);
    }
  };

  return (
    <ScrollView>
      <View style={styles.taskList}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#414757" />
      ) : (
        <>
          {tasks.length > 0 ? (
            <View style={styles.tasksList}>
              {tasks.map(task => {
  if (task.progress >= 100) { // Only display tasks with progress 100% or more
    return (
      <View key={task.id} style={styles.taskCard}>
        <View style={styles.taskItem}>
          <Text style={styles.taskName}>{task.task}</Text>
            <MaterialIcons name='check-circle' size={20} color='green' />
          <TouchableOpacity onPress={() => handleDelete(task.id)}>
            <MaterialIcons name='delete' size={20} color='red' />
          </TouchableOpacity>
        </View>
        <View style={styles.taskDetails}>
          <Text style={styles.taskPriority}>Priority: {task.priority ?? 'N/A'}</Text>
          <Text style={styles.taskProgress}>Drag to set Progress: {task.progress ?? 0}%</Text>
        </View>
        <View style={styles.sliderContainer}>
          <Slider
            style={{ ...styles.slider, height: 20 }}
            value={task.progress}
            onValueChange={value => handleProgressChange(task.id, value)}
            minimumValue={0}
            maximumValue={100}
            step={1}
          />
        </View>
        <TouchableOpacity
          style={styles.priorityButton}
        >
          <Text style={styles.priorityButtonText}>Complete</Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    <View style={styles.tasksList}>
              <Text style={styles.emptyText}>No Complete Tasks!</Text>
    </View>
  }
})}

            </View>
          ) : (
            <View style={styles.tasksList}>
              <Text style={styles.emptyText}>No Tasks Yet!</Text>
            </View>
          )}
        </>
      )}
    </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  tasksList: {
    marginTop: 10,
    padding: 5,
    backgroundColor: '#f4f4f4',
    borderRadius: 7,
  },
  taskDetails:{
    marginLeft:10
  },
  priorityButton:{
    marginLeft:10,
    marginBottom:8,
    backgroundColor:'green',
    width:'20%',
    padding: 1,
    borderRadius:2
  },
  priorityButtonText:{
    color:'#fff'
  },
  taskPriority:{
    marginBottom:3
  },
  taskProgress:{
    marginBottom:4
  },
  taskCard: {
    backgroundColor: '#f2f2f2',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderRadius: 7,
    marginVertical: 5,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  taskName: {
    fontSize: 17,
    fontWeight: '100',
    color: "#5B5B5B",
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#777',
  },
});

export default TaskListComplete;
