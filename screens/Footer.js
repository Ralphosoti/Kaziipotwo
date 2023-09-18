import React, {useState, useEffect, useRef} from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ActivityIndicator,
  FlatList,
  TextInput,
  Alert, }
   from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { MaterialIcons } from '@expo/vector-icons';
import { useUserContext } from "../userContext";
import firebase from "../firebase";

const Footer = ({ handleTabClick, activeTab }) => {
  const navigation = useNavigation();
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
    setLocationDialogVisible(false); 
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
    setLocationDialogVisible(true); 
  };

  const handleSaveTask = async () => {
    setIsAddingTask(true);
    try {
      const uniqueId = generateUniqueId();
      await firebase.firestore().collection('tasks').doc(uniqueId).set({
        task: text,
        date: new Date(),
        location: selectedLocation,
        user: firebase.auth().currentUser.uid,
      }); 

      //addItem(text);
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

  const mapsKey = process.env.EXPO_PUBLIC_GOOGLEMAPSKEY;


  return (
    <><View style={styles.container}>
      <TouchableOpacity style={[styles.iconContainer, activeTab === 'map' && styles.activeTab]}
        onPress={() => handleTabClick('map')}
      >
        <Ionicons name="home" size={24} color="black" />
        <Text style={styles.caption}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.iconContainer, activeTab === 'tasks' && styles.activeTab]}
        onPress={() => handleTabClick('tasks')}
      >
        <Ionicons name="checkmark-circle" size={24} color="black" />
        <Text style={styles.caption}>My Tasks</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.iconContainer, styles.centerIconContainer]} onPress={handleAddTask}>
        <View style={styles.plusIcon}>
          <Ionicons name="add" size={32} color="white" style={styles.plusIconTop} />
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.iconContainer, activeTab === 'notifications' && styles.activeTab]}
        onPress={() => handleTabClick('notifications')}
      >
        <Ionicons name="notifications" size={24} color="black" />
        <Text style={styles.caption}>Notifications</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.iconContainer, activeTab === 'profile' && styles.activeTab]}
        onPress={() => handleTabClick('profile')}
      >
        <Ionicons name="person" size={24} color="black" />
        <Text style={styles.caption}>Profile</Text>
      </TouchableOpacity>

      <Modal
      visible={isLocationDialogVisible}
      animationType="slide"
      transparent={true}
      style={styles.modalContainerMain}
    >
        <View style={styles.modalContainerr}>
          <View style={styles.searchBarContainer}>
            <Text style={styles.topLabel}>New Task</Text>
            <GooglePlacesAutocomplete
              placeholder="Attatch a city or town"
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
              ref={searchBoxRef} />
          <TextInput
            placeholder="write task here..."
            style={styles.input}
            onChangeText={onChange}
            value={text}
            ref={component => this._textInput = component}
          />
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => setLocationDialogVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn} onPress={handleSaveTask} disabled={isAddingTask}>
                {isAddingTask ? (
                  <ActivityIndicator size="small" color="darkslateblue" />
                ) : (
                  <Text style={styles.btnText}>
                    <Icon name="plus" size={15} /> Add 
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal><Modal
        visible={deleteModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainerdelete}>
          <View style={styles.modalContentdelete}>
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
    
    
   </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    paddingVertical: 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  iconContainer: {
    flex: 1,
    alignItems: 'center',
  },
  centerIconContainer: {
    alignItems: 'center',
  },
  caption: {
    color: '#111',
    fontWeight: 'bold',
    fontSize: 12,
  },
  plusIcon: {
    position:'absolute',
    bottom:-10,
    borderRadius: '50%',
    backgroundColor: '#E21E04',
    borderRadius: 999,
    padding: 10,
    elevation: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#111',
  },
  input: {
    height: 60,
    flexDirection:'row',
  },
  btn: {
    color: 'white',
    fontSize: 15,
    padding: 1,
    backgroundColor: '#414757',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginLeft:12,
    padding:4
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
  },
  taskInfo: {
    flexDirection: 'column',
    alignItems: 'left',
  },
  dateText: {
    color: 'darkblue',
  },

  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainerMain:{
    padding:10
  },
  modalContainerr: {
    position: 'absolute',
    zIndex: 1000000000,
    top: '28%',
    left: '3.5%',
    width: '92.8%',
    backgroundColor: '#ffff',
    borderRadius: 10,
    padding: 20,
    elevation: 125,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  deleteButtonText: {
    color: 'red',
  },
  topLabel:{
    fontWeight:'700',
  },
  searchBarContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,  
    marginBottom: 10,
  },
  searchBar: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    marginTop:14,
    width:'100%'
  },

  buttonContainer: {
    display:'flex',
    flexDirection: 'row',
    alignItems:'flex-end',
    justifyContent:'flex-end',
    zIndex: 100,
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

export default Footer;
