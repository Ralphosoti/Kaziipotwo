import React, { useState, createRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, TextInput, Alert, ScrollView, ActivityIndicator, Modal} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import firebase from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { useUserContext } from '../userContext';
import * as Location from 'expo-location';
import RNDateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

const GoogleMap = () => { 
   const [savedLocations, setSavedLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [expandedItems, setExpandedItems] = useState({});


  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [mylocation, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null); 
  const [isLocationLoading, setIsLocationLoading] = useState(true); 
  const { user } = useUserContext(); 


  useEffect(() => {
    const getLocation = async () => {
      let { status } = fetchSavedLocations();
      if (status) {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        setLocationError(null);
        setIsLocationLoading(false);
       // return;
      }
  
      try {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        setLocationError(null);
      } catch (error) {
        console.error('Error getting location:', error);
        setLocationError('Failed to get location');
      } finally {
        setIsLocationLoading(false);
      }
    };
  
    getLocation(); 
  
  }, []); 
  
  const calculateDistance = (latitude, longitude) => {
    try {
      if (!mylocation) {
        console.log('Initialize location failed');
        return null;
      }
      const userLatitude = mylocation.coords.latitude;
      const userLongitude = mylocation.coords.longitude;
      
      let realDistance = calculateRealDistance(userLatitude, userLongitude,latitude, longitude);
      
      return realDistance;
    } catch (error) {
      console.error('Error calculating distance:', error);
      return null;
    }
  };

  const calculateRealDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; 
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };
  
  const renderAccordionContent = (item) => {
    if (expandedItems[item.id]) {
      const distance = calculateDistance(item.latitude, item.longitude);
      return (
        <View>
          <Text style={styles.taskText}>{item.task}</Text>
          {distance !== null && (
            <Text style={styles.distanceText}>
              {distance.toFixed(2)} km away
            </Text>
          )}
        </View>
      );
    }

    return null;
  };

  const renderAccordionButton = (item) => (
    <TouchableOpacity
      style={styles.accordionButton}
      onPress={() => {
        setExpandedItems((prevExpandedItems) => ({
          ...prevExpandedItems,
          [item.id]: !prevExpandedItems[item.id],
        }));
      }}
    >
      <Text style={styles.accordionButtonText}>
        {expandedItems === item.id ? 'Hide' : 'Task'}
      </Text>
    </TouchableOpacity>
  );

   useEffect(() => {
    fetchSavedLocations();
  }, []); 

  const fetchSavedLocations = async () => {
    try {
      const querySnapshot = await firebase.firestore().collection('locations')
      .where('user', '==', user.uid)
      .orderBy('date', 'desc')
      .get();
      const parsedLocations = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        location: doc.data().location,
        task: doc.data().task || '', 
        latitude: doc.data().latitude || 0, 
        longitude: doc.data().longitude || 0,
      }));
      setSavedLocations(parsedLocations);
      setIsLoading(false);
    } catch (error) {
      console.log('Error fetching saved locations:', error);
      setIsLoading(false); 
    }
  };


  const handleDeleteLocation = async (id) => {
    setIsLoading(true);
    try {
      await firebase.firestore().collection('locations').doc(id).delete();
      fetchSavedLocations();
    } catch (error) {
      console.log('Error deleting location:', error);
    }
  };


  const handleDeleteLocationTask = async (id) => {
    setIsLoading(true);
    try {
      await firebase.firestore().collection('tasks').doc(id).delete();
      fetchSavedLocations();
    } catch (error) {
      console.log('Error deleting location:', error);
    }
  };

  const handleConfirmDelete = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this location?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDeleteLocation(id),
        },
      ],
      { cancelable: true }
    );
  };

  const handleConfirmDeleteTaskL = (id) => {
    Alert.alert(
      'Confirm Delete',
      'This Task will be deleted permanently?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDeleteLocationTask(id),
        },
      ],
      { cancelable: true }
    );
  };
  

  const renderItem = ({ item }) => (
    <View style={styles.locationCard}>
      <TouchableOpacity
        onPress={() => handleConfirmDelete(item.id)}
        style={styles.deleteButton}
      >
        <MaterialIcons name="delete" size={18} color="#FF0000" />
      </TouchableOpacity>
      <Text style={styles.locationText}>{item.location}</Text>
      {item.task && (
          <View>
          {renderAccordionButton(item)}
          {renderAccordionContent(item)}
        </View>
      )}
    </View>
  );


  const [selectedLocation, setSelectedLocation] = useState(null);
  const [taskInput, setTaskInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const openDialog = (task, id) => {
    setSelectedTask(task);
    setIsDialogVisible(true);
    setSelectedTaskId(id);
  };

  const closeDialog = () => {
    setIsDialogVisible(false);
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      await firebase.firestore().collection('tasks').doc(id).delete();
      fetchSavedLocations();
    } catch (error) {
      console.log('Error deleting location:', error);
    }
    closeDialog();
  };


  const handleDateChange = (event, selected) => {
    const currentDate = selected || selectedDate;
    setShowDatePicker(false);
    setSelectedDate(currentDate);

    const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
    setDateInput(formattedDate);
  };
  
  useEffect(() => {
    const unsubscribe = firebase.firestore().collection('tasks')
    .where('user', '==', user.uid)
    .orderBy('date', 'desc')
    .onSnapshot(snapshot => {
      const tasksData = [];
      snapshot.forEach(doc => {
        tasksData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setTasks(tasksData);
    });

    return () => unsubscribe();
  }, []);

  const navigation = useNavigation();

  const searchBoxRef = createRef(null);

  const handleLocationSave = () => {
    if (selectedLocation) {
      setShowTaskDialog(true);
    } else {
      showAlert('Error', 'Please Enter a Valid Location');
    }
  };

  const saveTaskToFirestore = async (task, datex, location, latitude, longitude) => {
    if (!task) return;

    try {
      const uniqueId = generateUniqueId();
      await firebase.firestore().collection('tasks').doc(uniqueId).set({
        location: location,
        task: task,
        latitude: latitude, 
        longitude: longitude,
        user: firebase.auth().currentUser.uid,
        date: new Date(),
        due:datex
      });

      await firebase.firestore().collection('locations').doc(uniqueId).set({
        location: location,
        task: task,
        latitude: latitude, 
        longitude: longitude, 
        user: firebase.auth().currentUser.uid,
        date: new Date(),
        due:datex
      });

      showAlert('Success', 'Task saved successfully');
      setTaskInput('');
      setSelectedLocation(null);
      fetchSavedLocations();
    } catch (error) {
      console.log('Error saving task:', error);
    }
  };

  const handleConfirmTask = () => {
    saveTaskToFirestore(taskInput, dateInput, selectedLocation, selectedCoordinates.latitude, selectedCoordinates.longitude);
    setShowTaskDialog(false);
  };

  const showAlert = (title, message) => {
    Alert.alert(
      `${title}`,
      `${message}`,
      [
        {
          text: 'Ok',
        },
      ],
      { cancelable: false },
    );
  };

  const handleLocationPress = (data, details) => {
    if (details && details.geometry && details.geometry.location) {
      const { lat, lng } = details.geometry.location;
      console.log('Selected Location:', details.formatted_address);
      setSelectedLocation(details.formatted_address);
      setSelectedCoordinates({ latitude: lat, longitude: lng });

      searchBoxRef.current?.setAddressText(''); // Clear the search box after selection
    }
  };

  const generateUniqueId = () => {
    const randomText = Math.random().toString(36).substring(2, 10);
    const timestamp = new Date().getTime();
    const randomChars = Math.random().toString(36).substring(2, 10);
    return `${randomText.replace(/\s+/g, '_')}_${timestamp}_${randomChars}`;
  };



  const mapsKey = process.env.EXPO_PUBLIC_GOOGLEMAPSKEY;

  return (
    <View style={styles.container}>
      <View style={styles.searchAndSaveContainer}>
        <View style={styles.searchBarContainer}>
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
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={handleLocationSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
      <ScrollView>
      
      <View style={styles.locationTextRow}>
        <Text style={styles.subtitleLocationText}>Locations</Text>
      </View>
      {isLocationLoading ? (
    <ActivityIndicator size="large" color="#414757" />
  ) : (
    <>
      {locationError && (
        <Text style={styles.errorText}>{locationError}</Text>
      )}
      {isLoading ? (
        <ActivityIndicator size="large" color="#414757" />
      ) : (
        <View style={styles.locationCardContainer}>
          {savedLocations.length > 0 ? (
            savedLocations.map((location) => (
              <TouchableOpacity
                key={location.id}
                style={styles.locationCard}
              >
                <Text style={styles.locationText}>{location.location}</Text>
                {location.task && (
                  <View style={styles.locationiconsStyle}>
                    {renderAccordionButton(location)}
                    {renderAccordionContent(location)}
                    <TouchableOpacity
                      onPress={() => handleConfirmDelete(location.id)}
                      >
                    <MaterialIcons name='delete' size={28} style={styles.locationDeleteIcon}/>

              </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No saved locations found</Text>
          )}
          
        </View>
      )}
    </>
  )}

        <View style={styles.tasksContainerTop}>
            <TouchableOpacity style={styles.tasksSubtitle} onPress={() => navigation.navigate('TaskList')}>
              <Text style={styles.subtitleText}>Tasks</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tasksSubtitle} onPress={() => navigation.navigate('TaskListComplete')}>
              <Text style={styles.subtitleText}>Complete</Text>
            </TouchableOpacity>
        </View>
      {isLocationLoading ? (
    <ActivityIndicator size="large" color="#414757" />
  ) : (
    <>
      {tasks.length > 0 ? (
        <ScrollView>
            <View style={styles.tasksList}>
        {tasks.map(task => {
          
          if(task.progress== null || task.progress < 100){
            return (
              <TouchableOpacity
            key={task.id}
            style={styles.taskItem}
            onPress={() => openDialog(task, task.id)} 
            >
              
            <Text style={styles.taskName}>{task.task}</Text>
            <MaterialIcons name='arrow-forward-ios' size={11}></MaterialIcons>
          </TouchableOpacity>
            );
          }
})}
      </View>
        </ScrollView>
      ):(
        <View style={styles.tasksList}>
            <Text style={styles.emptyText}>No Tasks Yet!</Text>
        </View>
      )}
       <Modal visible={isDialogVisible} transparent animationType="slide">
        <View style={styles.dialogContainer}>
          <View style={styles.dialogContent}>
            <Text style={styles.dialogTitle}>Task Details</Text>
            <Text>Task name: {selectedTask?.task}</Text>
            <Text>Task location: {selectedTask?.location}</Text>
            <Text>Due date: {selectedTask?.due}</Text>
            <Text>Priority: {selectedTask?.priority}</Text>
            <Text>Progress: {selectedTask?.progress}% done</Text>
            <View style={styles.dialogButtons}>
              <TouchableOpacity onPress={closeDialog}>
                <Text style={[styles.dialogButton, { color: '#414757' }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
</>
  )}
      {showTaskDialog && (
        <View style={styles.taskDialog}>
          <Text style={styles.dialogTitle}>Attach task to {selectedLocation}</Text>
          <TextInput
            style={styles.taskInput}
            placeholder="Attach task or leave blank"
            value={taskInput}
            onChangeText={setTaskInput}
          />
          <TextInput
            style={styles.taskInput}
            placeholder="Due on, e.g 22/09/2023"
            value={dateInput}
            onTouchStart={() => setShowDatePicker(true)}
          />
             {showDatePicker && (
          <RNDateTimePicker 
            mode="date"
            display="spinner"
            value={selectedDate}
            minimumDate={new Date()}
            onChange={handleDateChange}
          />)}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.dialogButton, styles.cancelButton]}
              onPress={() => {
                setShowTaskDialog(false);
                setSelectedLocation(null);
                setTaskInput('');
              }}
            >
              <Text style={styles.dialogButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dialogButton, styles.confirmButton]}
              onPress={handleConfirmTask}
            >
              <Text style={styles.dialogButtonText}>Confirm Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
</ScrollView >
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding:15
  },
  dialogContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dialogContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  dialogButton: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  searchAndSaveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    margin: 10,
    elevation: 4,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    position:'absolute',
    left:150,
    top:10,
  },
  searchBar: {
    flex: 1,
    height: 40,
  },
  tasksList: {
    marginTop: 10,
    padding:5,
    backgroundColor:'#f4f4f4',
    borderRadius:7,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f2f2f2',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 19,
    width:'100%'
  },
  taskName: {
    fontSize: 17,
    fontWeight:'100',
    color:"#5B5B5B"
  },
  taskLocation: {
    fontSize: 14,
    color: '#888',
  },
  saveButton: {
    position:'absolute',
    right:0,
    top:0,
    marginTop:4,
    marginRight:5,
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop:5,
    backgroundColor: '#414757',
    borderRadius: 15,
    elevation: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tasksSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitleLocationText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft:20,
    marginBottom:5
  },
  locationTextRow:{
    display:'flex',
    flexDirection: 'row',
    justifyContent:'space-between'
  },
  subtitleLocationTextOpen: {
    fontSize: 13,
    fontWeight: '400',
    textDecorationLine:'underline',
    textTransform:'uppercase',
  },
  subtitleText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskDialog: {
    position: 'absolute',
    zIndex: 1000000000,
    top: '1.5%',
    left: '0',
    width: '99.8%',
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 20,
    elevation: 125,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  taskInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  dialogButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#E21E04',
  },
  confirmButton: {
    backgroundColor: '#414757',
  },
  dialogButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  locationCard: {
    marginBottom: 13,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    padding:10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width:'100%'
  },
  locationCardContainer:{
    backgroundColor: '#f2f2f2',
    padding: 19,
    width:'100%',
    borderRadius:5,
  },
  locationiconsStyle:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tasksContainerTop:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationDeleteIcon:{
    color: '#E21E04',
    marginLeft:5
  },
  locationText: {
    fontSize: 16,
    textAlign: 'left',
    flex: 1,
    color:'#5B5B5B'
  },
  deleteButton: {
    padding: 5,
  },
  accordionButton: {
    backgroundColor: '#414757',
    padding: 5,
    borderRadius: 5,
  },
  accordionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  taskText: {
    fontSize: 7,
    textAlign: 'left',
    marginBottom: 5,
    marginLeft: 5,
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'left',
  },
});

export default GoogleMap;
