import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { MaterialIcons } from '@expo/vector-icons';
import { useUserContext } from "../userContext";
import firebase from '../firebase';
import { ScrollView } from 'react-native';

const AddTask = ({ addItem }) => {
  const { user } = useUserContext(); 
  const [text, setText] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLocationDialogVisible, setLocationDialogVisible] = useState(false); 
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [accordionOpenStates, setAccordionOpenStates] = useState({});

  const toggleAccordion = (taskId) => {
    setAccordionOpenStates((prevState) => ({
      ...prevState,
      [taskId]: !prevState[taskId],
    }));
  };
  const searchBoxRef = useRef(null);

  const clearText = () => {
    this._textInput.setNativeProps({ text: ' ' });
  
    setTimeout(() => {
      this._textInput.setNativeProps({ text: '' });
     },3);
  }

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection('tasks')
      .where('user', '==', user.uid)
      .orderBy('date', 'desc') 
      .onSnapshot((snapshot) => {
        const tasksData = [];
        snapshot.forEach((doc) => {
          tasksData.push({ id: doc.id, ...doc.data() });
        });
        setTasks(tasksData);
        setIsLoading(false);
      });
  
    return () => unsubscribe();
  }, []);
  
  const handleLocationPress = (data, details) => {
    setSelectedLocation(details.formatted_address);
    searchBoxRef.current?.clear(); // Clear the search box
  };

  const onChange = (textValue) => setText(textValue);

  const handleAddTask = () => {
    if (text.trim() === '') {
      return;
    }
    setLocationDialogVisible(true); 
  };

  const handleSaveTask = async () => {
    if (text.trim() === '') {
      return;
    }


    setIsAddingTask(true);
    try {
      const uniqueId = generateUniqueId();
      await firebase.firestore().collection('tasks').doc(uniqueId).set({
        task: text,
        date: new Date(),
        location: selectedLocation,
        user: firebase.auth().currentUser.uid,
      }); 

      addItem(text);
      clearText();
    } catch (error) {
      console.log('Error storing user data:', error);
    } finally {
      setIsAddingTask(false);
      clearText();
      setLocationDialogVisible(false); 
    }
  };

  const handleDeleteTask = async () => {
    setDeleteModalVisible(false);

    try {
      await firebase.firestore().collection('tasks').doc(selectedTaskId).delete();
    } catch (error) {
      console.log('Error deleting task:', error);
    }
  };

  const generateUniqueId = () => {
    const timestamp = new Date().getTime();
    const randomChars = Math.random().toString(36).substring(2, 10);
    return `${text.replace(/\s+/g, '_')}_${timestamp}_${randomChars}`;
  };

  const renderTaskItem = ({ item }) => (
    <ScrollView>
          <View style={styles.taskItem}>
      <View style={styles.taskInfo}>
        <Text style={styles.taskText}>{item.task}</Text>
        <Text style={styles.dateText}>{item.date.toDate().toLocaleDateString()}</Text>
        {item.location && (
          <TouchableOpacity
            style={styles.locationButton}
            onPress={() => toggleAccordion(item.id)}
          >
            <Text style={styles.locationButtonText}>
              {accordionOpenStates[item.id] ? 'Close' : 'Attatched Location'}
            </Text>
          </TouchableOpacity>
        )}
        {accordionOpenStates[item.id] && item.location && (
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        )}
          {isAccordionOpen && item.location && (
            <View style={styles.locationContainer}>
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
          )}
      </View>
      <TouchableOpacity onPress={() => {
          setDeleteModalVisible(true);
          setSelectedTaskId(item.id);
        }}>
        <Icon name="trash" size={20} color="red" />
      </TouchableOpacity>
    </View>
    </ScrollView>
  );

  const mapsKey = process.env.EXPO_PUBLIC_GOOGLEMAPSKEY;

  return (
       <View flex={1}>
      <TextInput
        placeholder="Add Task..."
        style={styles.input}
        onChangeText={onChange}
        value={text}
        ref={component => this._textInput = component}
      />
      <TouchableOpacity style={styles.btn} onPress={handleAddTask} disabled={isAddingTask}>
        {isAddingTask ? (
          <ActivityIndicator size="small" color="darkslateblue" />
        ) : (
          <Text style={styles.btnText}>
            <Icon name="plus" size={20} /> Add Task
          </Text>
        )}
      </TouchableOpacity>
      {isLoading ? (
        <ActivityIndicator style={styles.loadingIndicator} size="large" color="darkslateblue" />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTaskItem}
        />
      )}
      <Modal
        visible={isLocationDialogVisible}
        animationType="slide"
        transparent={true}
      >
        
        <View style={styles.modalContainer}>
          <View style={styles.searchBarContainer}>
          <Text style={styles.topLabel}>Attatch a Location</Text>
            <MaterialIcons name="location-on" size={24} color="#111" style={styles.locationIcon} />
            <GooglePlacesAutocomplete
              placeholder="Search here"
              onPress={handleLocationPress}
              styles={{
                textInput: styles.searchBar,
              }}
              fetchDetails
              enablePoweredByContainer={false}
              query={{
                key: mapsKey,
                language: 'en',
              }}
              ref={searchBoxRef}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => setLocationDialogVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveTask}>
                <Text style={styles.SaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={deleteModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Are You Sure You want to Delete This Task?</Text>
            <TouchableOpacity onPress={handleDeleteTask}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDeleteModalVisible(false)}>
              <Text>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 60,
    padding: 8,
    margin: 5,
  },
  btn: {
    backgroundColor: '#c2bad8',
    padding: 9,
    margin: 5,
    marginBottom:20,
  },
  btnText: {
    color: 'darkslateblue',
    fontSize: 20,
    textAlign: 'center',
  },
  taskInfo: {
    flexDirection: 'column',
    alignItems: 'left',
  },
  dateText: {
    color: 'darkblue',
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'red',
  },
  topLabel:{
    position:'absolute',
    top:0,
    left:15,
    fontWeight:'700',
  },
  searchBarContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap:'wrap'
  },
  searchBar: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    marginTop:14,
    flexWrap:'wrap',
    maxWidth:225
  },
  locationIcon: {
    marginRight: 10,
    position: 'absolute',
    top: 28,
    left: 210,
    zIndex: 999,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems:'right',
    position: 'absolute',
    top: 28,
    left: 240,
    zIndex: 999,
  },
  SaveText: {
    color: 'white',
    fontSize: 15,
    padding: 1,
    backgroundColor: '#00C851',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginLeft:12,
    padding:4
  },
  cancelText: {
    color: 'white',
    fontSize: 15,
    padding: 1,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginLeft:2,
    padding:4
  },
  locationButton: {
    marginTop: 5,
    backgroundColor: '#e0e0e0',
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  locationButtonText: {
    color: 'blue',
  },
  locationContainer: {
    marginTop: 5,
  },
  locationText: {
    color: 'darkgreen',
  },
});

export default AddTask;
